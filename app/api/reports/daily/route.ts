import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// Define schemas for reports
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
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    // Generate daily report data
    const dailyReports = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      
      // Count applications for this day
      const applications = await VisaApplication.find({
        createdAt: {
          $gte: currentDate,
          $lt: nextDate
        }
      });
      
      // Calculate revenue for this day
      const payments = await Payment.find({
        createdAt: {
          $gte: currentDate,
          $lt: nextDate
        }
      });
      
      const dailyRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const dailyCommission = payments.reduce((sum, payment) => sum + (payment.commission || 0), 0);
      
      dailyReports.push({
        date: currentDate.toISOString().split('T')[0],
        count: applications.length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        pending: applications.filter(app => app.status === 'processing').length,
        revenue: dailyRevenue,
        commission: dailyCommission,
        applications: applications.map(app => ({
          id: app._id,
          applicantName: app.applicantName,
          visaType: app.visaType,
          status: app.status,
          agent: app.agent
        }))
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = [
        'Date',
        'Applications',
        'Approved',
        'Rejected',
        'Pending',
        'Revenue',
        'Commission'
      ].join(',');
      
      const csvRows = dailyReports.map(report => {
        return [
          `"${report.date}"`,
          `"${report.count}"`,
          `"${report.approved}"`,
          `"${report.rejected}"`,
          `"${report.pending}"`,
          `"${report.revenue}"`,
          `"${report.commission}"`
        ].join(',');
      });
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `daily-report-${new Date().toISOString().slice(0, 10)}.csv`;
      
      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else {
      return NextResponse.json(dailyReports);
    }
  } catch (error) {
    console.error('Error generating daily report:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily report' },
      { status: 500 }
    );
  }
}