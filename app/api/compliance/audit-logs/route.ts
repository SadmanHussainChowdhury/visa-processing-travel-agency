import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';

// Mock audit log data since we don't have a specific audit log model
const mockAuditLogs = [
  {
    id: 'log1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: 'admin@visaagency.com',
    action: 'login',
    resource: 'dashboard',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: 'log2',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    user: 'agent1@visaagency.com',
    action: 'view_client',
    resource: 'client/CL001',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: 'log3',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    user: 'admin@visaagency.com',
    action: 'update_settings',
    resource: 'settings/security',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: 'log4',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    user: 'agent2@visaagency.com',
    action: 'upload_document',
    resource: 'document/upload',
    ip: '192.168.1.102',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: 'log5',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    user: 'admin@visaagency.com',
    action: 'generate_report',
    resource: 'reports/compliance',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: 'log6',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    user: 'agent3@visaagency.com',
    action: 'create_visa_application',
    resource: 'visa-applications/new',
    ip: '192.168.1.103',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: 'log7',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    user: 'admin@visaagency.com',
    action: 'export_data',
    resource: 'exports/compliance-report',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  }
];

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const action = url.searchParams.get('action') || '';
    const user = url.searchParams.get('user') || '';
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';

    // Filter logs based on query parameters
    let filteredLogs = [...mockAuditLogs];

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(action));
    }

    if (user) {
      filteredLogs = filteredLogs.filter(log => log.user.includes(user));
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

    // Sort logs by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    const auditData = {
      logs: paginatedLogs,
      totalCount: filteredLogs.length,
      limit,
      offset,
      totalPages: Math.ceil(filteredLogs.length / limit),
      currentPage: Math.floor(offset / limit) + 1
    };

    return NextResponse.json(auditData);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { action } = body;

    switch(action) {
      case 'export-logs':
        // In a real app, this would generate and return an export file
        return NextResponse.json({ 
          success: true,
          exportId: 'exp_' + Date.now(),
          message: 'Audit logs export started'
        });
        
      case 'clear-logs':
        // In a real app, this would clear old audit logs based on retention policy
        return NextResponse.json({ 
          success: true,
          message: 'Audit logs cleared according to retention policy'
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid audit logs action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling audit logs action:', error);
    return NextResponse.json(
      { error: 'Failed to handle audit logs action' }, 
      { status: 500 }
    );
  }
}