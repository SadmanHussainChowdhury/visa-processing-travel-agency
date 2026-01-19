import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaApplication from '@/models/VisaApplication';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get GDPR and local compliance data
    const totalApplications = await VisaApplication.countDocuments();
    const compliantApplications = await VisaApplication.countDocuments({
      'dataProcessingConsent': true,
      'dataProcessingDate': { $exists: true }
    });
    
    // Get audit logs (we'll simulate this since we don't have an audit log model)
    const auditLogs = [
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
      }
    ];

    const complianceData = {
      gdprStatus: totalApplications > 0 ? (compliantApplications === totalApplications ? 'compliant' : 'partial') : 'pending',
      localComplianceStatus: 'compliant',
      encryptionStatus: 'active',
      auditLogs,
      twoFactorEnabled: true,
      backupStatus: 'up-to-date',
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      nextBackup: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      totalApplications,
      compliantApplications
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
        // Simulate toggling two-factor authentication
        return NextResponse.json({ 
          success: true, 
          twoFactorEnabled: !body.currentStatus 
        });
        
      case 'run-backup':
        // Simulate running a backup
        return NextResponse.json({ 
          success: true, 
          backupStatus: 'up-to-date',
          lastBackup: new Date().toISOString()
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