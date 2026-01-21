import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaApplication from '@/models/VisaApplication';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Set default date range if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks ago
    
    // Generate weekly report data
    const weeklyReports = [];
    const currentDate = new Date(start);
    
    // Adjust to start of week (Sunday)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    
    while (currentDate <= end) {
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(currentDate.getDate() + 7);
      
      // Count applications for this week
      const applications = await VisaApplication.find({
        createdAt: {
          $gte: currentDate,
          $lt: weekEnd
        }
      });
      
      const weeklyRevenue = 0; // No payment data available
      const weeklyCommission = 0; // No payment data available
      
      // Format week range
      const weekLabel = `${currentDate.toISOString().split('T')[0]} to ${new Date(weekEnd.getTime() - 1).toISOString().split('T')[0]}`;
      
      weeklyReports.push({
        week: `Week ${Math.ceil((currentDate.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`,
        dateRange: weekLabel,
        count: applications.length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        pending: applications.filter(app => app.status === 'processing').length,
        revenue: weeklyRevenue,
        commission: weeklyCommission,
        applications: applications.map(app => ({
          id: app._id.toString(),
          applicantName: app.applicantName,
          visaType: app.visaType,
          status: app.status,
          agent: app.agent
        }))
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = [
        'Week',
        'Date Range',
        'Applications',
        'Approved',
        'Rejected',
        'Pending'
      ].join(',');
      
      const csvRows = weeklyReports.map(report => {
        return [
          `"${report.week}"`,
          `"${report.dateRange}"`,
          `"${report.count}"`,
          `"${report.approved}"`,
          `"${report.rejected}"`,
          `"${report.pending}"`
        ].join(',');
      });
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `weekly-report-${new Date().toISOString().slice(0, 10)}.csv`;
      
      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else {
      return NextResponse.json(weeklyReports);
    }
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly report' },
      { status: 500 }
    );
  }
}