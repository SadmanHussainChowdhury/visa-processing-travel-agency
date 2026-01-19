import mongoose from 'mongoose';
import Compliance from '../models/Compliance.js';
import AuditLog from '../models/AuditLog.js';
import { dbConnect } from '../lib/db.js';

async function initializeComplianceData() {
  try {
    await dbConnect();

    console.log('Initializing compliance data...');

    // Create initial compliance records
    const initialComplianceRecords = [
      {
        type: 'GDPR',
        status: 'compliant',
        description: 'Initial GDPR compliance check',
        details: {
          totalApplications: 0,
          compliantApplications: 0,
          compliancePercentage: 0
        },
        checkedBy: 'system'
      },
      {
        type: 'SECURITY',
        status: 'compliant',
        description: 'Initial security compliance check',
        details: {
          encryptionStatus: 'active',
          twoFactorEnabled: true,
          encryptionAlgorithm: 'AES-256',
          keyRotationPolicy: 'monthly',
          passwordPolicy: {
            minLength: 8,
            requireNumbers: true,
            requireSymbols: true,
            requireUppercase: true,
            requireLowercase: true,
            expireDays: 90
          },
          ipWhitelistEnabled: false,
          suspiciousLoginDetection: true,
          maxLoginAttempts: 5,
          lockoutDurationMinutes: 30
        },
        checkedBy: 'system'
      },
      {
        type: 'BACKUP',
        status: 'up-to-date',
        description: 'Initial backup compliance check',
        details: {
          backupSchedule: 'daily at 2:00 AM',
          retentionPeriod: '30 days',
          storageLocation: 'encrypted cloud storage',
          encryptionEnabled: true,
          compressionEnabled: true,
          backupSize: '2.4 GB',
          backupIntegrity: 'verified',
          recoveryTimeObjective: '4 hours',
          recoveryPointObjective: '1 hour',
          backupHistory: [
            {
              id: 'bkp_init',
              timestamp: new Date().toISOString(),
              size: '2.4 GB',
              status: 'completed',
              verification: 'passed'
            }
          ]
        },
        checkedBy: 'system'
      }
    ];

    for (const record of initialComplianceRecords) {
      const existing = await Compliance.findOne({ type: record.type });
      if (!existing) {
        await Compliance.create(record);
        console.log(`Created initial ${record.type} compliance record`);
      } else {
        console.log(`${record.type} compliance record already exists`);
      }
    }

    // Create some initial audit logs
    const initialAuditLogs = [
      {
        userId: 'admin',
        action: 'system-initialization',
        resource: 'compliance-setup',
        ipAddress: '127.0.0.1',
        userAgent: 'system-initializer',
        metadata: { description: 'Initial system compliance setup' }
      },
      {
        userId: 'admin',
        action: 'security-config',
        resource: 'security-settings',
        ipAddress: '127.0.0.1',
        userAgent: 'system-initializer',
        metadata: { description: 'Initial security configuration' }
      }
    ];

    for (const log of initialAuditLogs) {
      await AuditLog.create(log);
      console.log(`Created initial audit log for action: ${log.action}`);
    }

    console.log('Compliance data initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing compliance data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the initialization
if (require.main === module) {
  initializeComplianceData();
}

export default initializeComplianceData;