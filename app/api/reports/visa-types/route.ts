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
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);
    
    // Get all visa applications in the date range
    const applications = await VisaApplication.find({
      createdAt: {
        $gte: start,
        $lte: end
      }
    });
    
    // Group by visa type and calculate statistics
    const visaStats: { [key: string]: any } = {};
    
    applications.forEach(app => {
      const visaType = app.visaType || 'Unknown';
      if (!visaStats[visaType]) {
        visaStats[visaType] = {
          type: visaType,
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          processing: 0
        };
      }
      
      visaStats[visaType].total++;
      
      switch (app.status) {
        case 'approved':
          visaStats[visaType].approved++;
          break;
        case 'rejected':
          visaStats[visaType].rejected++;
          break;
        case 'processing':
          visaStats[visaType].processing++;
          break;
        case 'submitted':
          visaStats[visaType].pending++;
          break;
      }
    });
    
    // Calculate success rates
    const visaReports = Object.values(visaStats).map((stats: any) => ({
      ...stats,
      successRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
      rejectionRate: stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0,
      pendingRate: stats.total > 0 ? Math.round(((stats.pending + stats.processing) / stats.total) * 100) : 0
    }));
    
    // Sort by total applications descending
    visaReports.sort((a: any, b: any) => b.total - a.total);
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = [
        'Visa Type',
        'Total Applications',
        'Approved',
        'Rejected',
        'Processing',
        'Pending',
        'Success Rate %',
        'Rejection Rate %'
      ].join(',');
      
      const csvRows = visaReports.map((report: any) => {
        return [
          `"${report.type.replace(/"/g, '""')}"`,
          `"${report.total}"`,
          `"${report.approved}"`,
          `"${report.rejected}"`,
          `"${report.processing}"`,
          `"${report.pending}"`,
          `"${report.successRate}"`,
          `"${report.rejectionRate}"`
        ].join(',');
      });
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `visa-types-report-${new Date().toISOString().slice(0, 10)}.csv`;
      
      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else {
      return NextResponse.json(visaReports);
    }
  } catch (error) {
    console.error('Error generating visa types report:', error);
    return NextResponse.json(
      { error: 'Failed to generate visa types report' },
      { status: 500 }
    );
  }
}