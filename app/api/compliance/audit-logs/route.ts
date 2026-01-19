import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const action = url.searchParams.get('action') || '';
    const userId = url.searchParams.get('userId') || '';
    const resource = url.searchParams.get('resource') || '';
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    
    // Build query filters
    const filters: any = {};
    if (action) filters.action = { $regex: action, $options: 'i' };
    if (userId) filters.userId = { $regex: userId, $options: 'i' };
    if (resource) filters.resource = { $regex: resource, $options: 'i' };
    if (startDate) filters.timestamp = { ...filters.timestamp, $gte: new Date(startDate) };
    if (endDate) filters.timestamp = { ...filters.timestamp, $lte: new Date(endDate) };
    
    // Query the database for audit logs
    const query = AuditLog.find(filters);
    
    // Count total documents for pagination
    const totalCount = await AuditLog.countDocuments(filters);
    
    // Apply sorting and pagination
    const logs = await query
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
    
    // Transform the logs to match the expected format
    const transformedLogs = logs.map(log => ({
      id: log._id.toString(),
      timestamp: log.timestamp.toISOString(),
      user: log.userId,
      action: log.action,
      resource: log.resource,
      ip: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata
    }));

    const auditData = {
      logs: transformedLogs,
      totalCount,
      limit,
      offset,
      totalPages: Math.ceil(totalCount / limit),
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
        // Return audit logs for export
        const filters: any = {};
        if (body.startDate) filters.timestamp = { ...filters.timestamp, $gte: new Date(body.startDate) };
        if (body.endDate) filters.timestamp = { ...filters.timestamp, $lte: new Date(body.endDate) };
        if (body.action) filters.action = { $regex: body.action, $options: 'i' };
        if (body.userId) filters.userId = { $regex: body.userId, $options: 'i' };
        if (body.resource) filters.resource = { $regex: body.resource, $options: 'i' };
        
        const logs = await AuditLog.find(filters)
          .sort({ timestamp: -1 })
          .limit(10000) // Limit export to 10k records
          .lean();
        
        const transformedLogs = logs.map(log => ({
          id: log._id.toString(),
          timestamp: log.timestamp.toISOString(),
          user: log.userId,
          action: log.action,
          resource: log.resource,
          ip: log.ipAddress,
          userAgent: log.userAgent,
          metadata: log.metadata
        }));
        
        // Set response headers for CSV download
        const response = new NextResponse(JSON.stringify(transformedLogs, null, 2));
        response.headers.set('Content-Type', 'application/json');
        response.headers.set('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.json`);
        
        return response;
        
      case 'create-log':
        // Create a new audit log entry
        if (!body.userId || !body.action || !body.resource) {
          return NextResponse.json(
            { error: 'Missing required fields: userId, action, resource' }, 
            { status: 400 }
          );
        }
        
        const newLog = await AuditLog.create({
          userId: body.userId,
          action: body.action,
          resource: body.resource,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: body.metadata || {}
        });
        
        return NextResponse.json({
          success: true,
          logId: newLog._id.toString(),
          message: 'Audit log created successfully'
        });
        
      case 'clear-logs':
        // Clear old audit logs based on retention policy (e.g., keep last 30 days)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep last 30 days
        
        const result = await AuditLog.deleteMany({
          timestamp: { $lt: cutoffDate }
        });
        
        return NextResponse.json({ 
          success: true,
          deletedCount: result.deletedCount,
          message: `${result.deletedCount} old audit logs cleared according to retention policy`
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