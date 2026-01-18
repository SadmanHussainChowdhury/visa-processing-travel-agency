import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaApplication from '@/models/VisaApplication';
import Payment from '@/models/Payment';

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
    
    // Get all applications and payments in the date range
    const [applications, payments] = await Promise.all([
      VisaApplication.find({
        createdAt: {
          $gte: start,
          $lte: end
        }
      }),
      Payment.find({
        createdAt: {
          $gte: start,
          $lte: end
        },
        status: 'paid'
      })
    ]);
    
    // Group by agent for performance analysis
    const agentStats: { [key: string]: any } = {};
    
    // Process applications
    applications.forEach(app => {
      const agent = app.agent || 'Unassigned';
      if (!agentStats[agent]) {
        agentStats[agent] = {
          name: agent,
          applications: 0,
          successful: 0,
          rejected: 0,
          pending: 0,
          processing: 0,
          revenue: 0,
          commission: 0
        };
      }
      
      agentStats[agent].applications++;
      
      switch (app.status) {
        case 'approved':
          agentStats[agent].successful++;
          break;
        case 'rejected':
          agentStats[agent].rejected++;
          break;
        case 'processing':
          agentStats[agent].processing++;
          break;
        case 'submitted':
        case 'draft':
          agentStats[agent].pending++;
          break;
      }
    });
    
    // Process payments
    payments.forEach(payment => {
      const agent = payment.agent || 'Unassigned';
      if (!agentStats[agent]) {
        agentStats[agent] = {
          name: agent,
          applications: 0,
          successful: 0,
          rejected: 0,
          pending: 0,
          processing: 0,
          revenue: 0,
          commission: 0
        };
      }
      
      agentStats[agent].revenue += payment.amount || 0;
      agentStats[agent].commission += payment.commission || 0;
    });
    
    // Calculate performance metrics
    const agentReports = Object.values(agentStats).map((stats: any) => ({
      ...stats,
      successRate: stats.applications > 0 ? ((stats.successful / stats.applications) * 100) : 0,
      rejectionRate: stats.applications > 0 ? ((stats.rejected / stats.applications) * 100) : 0,
      pendingRate: stats.applications > 0 ? (((stats.pending + stats.processing) / stats.applications) * 100) : 0,
      avgRevenuePerApplication: stats.applications > 0 ? Math.round(stats.revenue / stats.applications) : 0,
      commissionRate: stats.revenue > 0 ? ((stats.commission / stats.revenue) * 100) : 0
    }));
    
    // Sort by revenue generated descending
    agentReports.sort((a: any, b: any) => b.revenue - a.revenue);
    
    // Calculate team averages
    const totalAgents = agentReports.length;
    const teamTotals = {
      totalApplications: agentReports.reduce((sum: number, agent: any) => sum + agent.applications, 0),
      totalSuccessful: agentReports.reduce((sum: number, agent: any) => sum + agent.successful, 0),
      totalRevenue: agentReports.reduce((sum: number, agent: any) => sum + agent.revenue, 0),
      totalCommission: agentReports.reduce((sum: number, agent: any) => sum + agent.commission, 0),
      avgSuccessRate: totalAgents > 0 ? 
        agentReports.reduce((sum: number, agent: any) => sum + agent.successRate, 0) / totalAgents : 0,
      avgRevenuePerAgent: totalAgents > 0 ? 
        Math.round(agentReports.reduce((sum: number, agent: any) => sum + agent.revenue, 0) / totalAgents) : 0
    };
    
    const performanceSummary = {
      agents: agentReports,
      teamAverages: teamTotals,
      topPerformer: agentReports.length > 0 ? agentReports[0] : null,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    };
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = [
        'Agent Name',
        'Applications',
        'Successful',
        'Rejected',
        'Pending',
        'Success Rate %',
        'Revenue Generated',
        'Commission Earned',
        'Avg Revenue/App'
      ].join(',');
      
      const csvRows = agentReports.map((agent: any) => {
        return [
          `"${agent.name.replace(/"/g, '""')}"`,
          `"${agent.applications}"`,
          `"${agent.successful}"`,
          `"${agent.rejected}"`,
          `"${agent.pending + agent.processing}"`,
          `"${agent.successRate.toFixed(1)}"`,
          `"${agent.revenue}"`,
          `"${agent.commission}"`,
          `"${agent.avgRevenuePerApplication}"`
        ].join(',');
      });
      
      // Add team summary row
      const summaryRow = [
        '"TEAM TOTAL/AVERAGE"',
        `"${teamTotals.totalApplications}"`,
        `"${teamTotals.totalSuccessful}"`,
        '""',
        '""',
        `"${teamTotals.avgSuccessRate.toFixed(1)}"`,
        `"${teamTotals.totalRevenue}"`,
        `"${teamTotals.totalCommission}"`,
        `"${teamTotals.avgRevenuePerAgent}"`
      ].join(',');
      
      const csvContent = [csvHeader, ...csvRows, summaryRow].join('\n');
      const fileName = `agent-performance-report-${new Date().toISOString().slice(0, 10)}.csv`;
      
      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else {
      return NextResponse.json(performanceSummary);
    }
  } catch (error) {
    console.error('Error generating agent performance report:', error);
    return NextResponse.json(
      { error: 'Failed to generate agent performance report' },
      { status: 500 }
    );
  }
}