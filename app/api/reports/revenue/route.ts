import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// Use existing payment schema
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
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);
    
    // Get all payments in the date range
    const payments = await Payment.find({
      createdAt: {
        $gte: start,
        $lte: end
      }
    });
    
    // Group by month for revenue analysis
    const monthlyRevenue: { [key: string]: any } = {};
    
    payments.forEach(payment => {
      if (payment.status === 'paid') {
        const paymentDate = new Date(payment.createdAt);
        const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        const monthName = paymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = {
            month: monthName,
            year: paymentDate.getFullYear(),
            monthNumber: paymentDate.getMonth() + 1,
            total: 0,
            commission: 0,
            transactions: 0,
            averageTransaction: 0
          };
        }
        
        monthlyRevenue[monthKey].total += payment.amount || 0;
        monthlyRevenue[monthKey].commission += payment.commission || 0;
        monthlyRevenue[monthKey].transactions++;
      }
    });
    
    // Calculate averages
    Object.values(monthlyRevenue).forEach((month: any) => {
      month.averageTransaction = month.transactions > 0 ? Math.round(month.total / month.transactions) : 0;
    });
    
    // Convert to array and sort by date
    const revenueReports = Object.values(monthlyRevenue)
      .sort((a: any, b: any) => {
        const dateA = new Date(`${a.year}-${String(a.monthNumber).padStart(2, '0')}-01`);
        const dateB = new Date(`${b.year}-${String(b.monthNumber).padStart(2, '0')}-01`);
        return dateA.getTime() - dateB.getTime();
      });
    
    // Calculate totals and averages
    const totalRevenue = revenueReports.reduce((sum: number, month: any) => sum + month.total, 0);
    const totalCommission = revenueReports.reduce((sum: number, month: any) => sum + month.commission, 0);
    const totalTransactions = revenueReports.reduce((sum: number, month: any) => sum + month.transactions, 0);
    const averageMonthlyRevenue = revenueReports.length > 0 ? Math.round(totalRevenue / revenueReports.length) : 0;
    const averageCommissionRate = totalRevenue > 0 ? ((totalCommission / totalRevenue) * 100).toFixed(2) : '0.00';
    
    const summary = {
      totalRevenue,
      totalCommission,
      totalTransactions,
      averageMonthlyRevenue,
      averageCommissionRate: parseFloat(averageCommissionRate),
      monthlyBreakdown: revenueReports
    };
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = [
        'Month',
        'Year',
        'Total Revenue',
        'Commission',
        'Transactions',
        'Average Transaction'
      ].join(',');
      
      const csvRows = revenueReports.map((report: any) => {
        return [
          `"${report.month}"`,
          `"${report.year}"`,
          `"${report.total}"`,
          `"${report.commission}"`,
          `"${report.transactions}"`,
          `"${report.averageTransaction}"`
        ].join(',');
      });
      
      // Add summary row
      const summaryRow = [
        '"TOTAL"',
        '""',
        `"${totalRevenue}"`,
        `"${totalCommission}"`,
        `"${totalTransactions}"`,
        `"${averageMonthlyRevenue}"`
      ].join(',');
      
      const csvContent = [csvHeader, ...csvRows, summaryRow].join('\n');
      const fileName = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
      
      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else {
      return NextResponse.json(summary);
    }
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return NextResponse.json(
      { error: 'Failed to generate revenue report' },
      { status: 500 }
    );
  }
}