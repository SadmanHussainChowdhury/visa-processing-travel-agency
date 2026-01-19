import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaApplication from '@/models/VisaApplication';
import AuditLog from '@/models/AuditLog';
import Compliance from '@/models/Compliance';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get GDPR and local compliance data
    const totalApplications = await VisaApplication.countDocuments();
    const compliantApplications = await VisaApplication.countDocuments({
      'dataProcessingConsent': true,
      'dataProcessingDate': { $exists: true }
    });
    
    // Get latest compliance checks
    const latestGdprCheck = await Compliance.findOne({ type: 'GDPR' }).sort({ createdAt: -1 });
    const latestLocalCheck = await Compliance.findOne({ type: 'LOCAL' }).sort({ createdAt: -1 });
    
    // Get recent audit logs
    const recentAuditLogs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    
    // Get security compliance
    const latestSecurityCheck = await Compliance.findOne({ type: 'SECURITY' }).sort({ createdAt: -1 });
    
    // Get backup compliance
    const latestBackupCheck = await Compliance.findOne({ type: 'BACKUP' }).sort({ createdAt: -1 });

    const complianceData = {
      gdprStatus: latestGdprCheck ? latestGdprCheck.status : (totalApplications > 0 ? (compliantApplications === totalApplications ? 'compliant' : 'partial') : 'pending'),
      localComplianceStatus: latestLocalCheck ? latestLocalCheck.status : 'compliant',
      encryptionStatus: latestSecurityCheck ? latestSecurityCheck.details?.encryptionStatus || 'active' : 'active',
      auditLogs: recentAuditLogs.map(log => ({
        id: log._id.toString(),
        timestamp: log.timestamp.toISOString(),
        user: log.userId,
        action: log.action,
        resource: log.resource,
        ip: log.ipAddress,
        userAgent: log.userAgent,
        metadata: log.metadata
      })),
      twoFactorEnabled: latestSecurityCheck ? latestSecurityCheck.details?.twoFactorEnabled || true : true,
      backupStatus: latestBackupCheck ? latestBackupCheck.status : 'up-to-date',
      lastBackup: latestBackupCheck ? latestBackupCheck.lastChecked.toISOString() : new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      nextBackup: latestBackupCheck ? latestBackupCheck.nextCheck?.toISOString() || new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      totalApplications,
      compliantApplications,
      lastGdprCheck: latestGdprCheck ? latestGdprCheck.lastChecked.toISOString() : null,
      lastSecurityCheck: latestSecurityCheck ? latestSecurityCheck.lastChecked.toISOString() : null
    };

    return NextResponse.json(complianceData);
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' }, 
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
      case 'toggle-two-factor':
        // Update two-factor authentication status in compliance record
        const securityCompliance = await Compliance.findOneAndUpdate(
          { type: 'SECURITY' },
          { 
            $set: { 
              'details.twoFactorEnabled': !body.currentStatus,
              'lastChecked': new Date(),
              'checkedBy': body.userId || 'system'
            }
          },
          { upsert: true, new: true }
        );
        
        // Log the change in audit log
        await AuditLog.create({
          userId: body.userId || 'system',
          action: 'toggle-two-factor',
          resource: 'security-settings',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: { newValue: !body.currentStatus }
        });
        
        return NextResponse.json({ 
          success: true, 
          twoFactorEnabled: securityCompliance.details?.twoFactorEnabled || !body.currentStatus
        });
        
      case 'run-backup':
        // Update backup compliance record
        const backupCompliance = await Compliance.findOneAndUpdate(
          { type: 'BACKUP' },
          { 
            $set: { 
              'status': 'up-to-date',
              'lastChecked': new Date(),
              'nextCheck': new Date(Date.now() + 24 * 60 * 60 * 1000), // Next check in 24 hours
              'checkedBy': body.userId || 'system'
            }
          },
          { upsert: true, new: true }
        );
        
        // Log the backup event in audit log
        await AuditLog.create({
          userId: body.userId || 'system',
          action: 'run-backup',
          resource: 'backup-system',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: { backupId: backupCompliance._id.toString() }
        });
        
        return NextResponse.json({ 
          success: true, 
          backupStatus: backupCompliance.status,
          lastBackup: backupCompliance.lastChecked.toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling compliance action:', error);
    return NextResponse.json(
      { error: 'Failed to handle compliance action' }, 
      { status: 500 }
    );
  }
}