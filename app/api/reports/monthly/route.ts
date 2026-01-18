import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// Use existing schemas from daily route
const visaApplicationSchema = new mongoose.Schema({
  applicantName: String,
  visaType: String,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processing', 'approved', 'rejected'],
    default: 'draft'
  },
  agent: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  applicationId: String,
  amount: Number,
  commission: Number,
  agent: String,
  status: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  createdAt: Date
}, { timestamps: true });

const VisaApplication = mongoose.models.VisaApplication || mongoose.model('VisaApplication', visaApplicationSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Set default date range if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1); // 1 year ago
    
    // Generate monthly report data
    const monthlyReports = [];
    const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
    
    while (currentDate <= end) {
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      
      // Count applications for this month
      const applications = await VisaApplication.find({
        createdAt: {
          $gte: currentDate,
          $lte: monthEnd
        }
      });
      
      // Calculate revenue for this month
      const payments = await Payment.find({
        createdAt: {
          $gte: currentDate,
          $lte: monthEnd
        }
      });
      
      const monthlyRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const monthlyCommission = payments.reduce((sum, payment) => sum + (payment.commission || 0), 0);
      
      // Format month name
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      
      monthlyReports.push({
        month: monthLabel,
        year: currentDate.getFullYear(),
        monthNumber: currentDate.getMonth() + 1,
        count: applications.length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        pending: applications.filter(app => app.status === 'processing').length,
        revenue: monthlyRevenue,
        commission: monthlyCommission,
        applications: applications.map(app => ({
          id: app._id,
          applicantName: app.applicantName,
          visaType: app.visaType,
          status: app.status,
          agent: app.agent
        }))
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = [
        'Month',
        'Year',
        'Applications',
        'Approved',
        'Rejected',
        'Pending',
        'Revenue',
        'Commission'
      ].join(',');
      
      const csvRows = monthlyReports.map(report => {
        return [
          `"${report.month}"`,
          `"${report.year}"`,
          `"${report.count}"`,
          `"${report.approved}"`,
          `"${report.rejected}"`,
          `"${report.pending}"`,
          `"${report.revenue}"`,
          `"${report.commission}"`
        ].join(',');
      });
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `monthly-report-${new Date().toISOString().slice(0, 10)}.csv`;
      
      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else {
      return NextResponse.json(monthlyReports);
    }
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}