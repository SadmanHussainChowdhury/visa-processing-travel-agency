import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get security configuration data
    const securityData = {
      encryptionStatus: 'active',
      encryptionAlgorithm: 'AES-256',
      keyRotationPolicy: 'monthly',
      lastKeyRotation: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      nextKeyRotation: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      twoFactorEnabled: true,
      twoFactorMethod: ['sms', 'totp'],
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
    };

    return NextResponse.json(securityData);
  } catch (error) {
    console.error('Error fetching security data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security configuration' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { action, config } = body;

    switch(action) {
      case 'toggle-two-factor':
        // In a real app, this would update user preferences in the database
        return NextResponse.json({ 
          success: true, 
          twoFactorEnabled: !config.currentStatus 
        });
        
      case 'update-password-policy':
        // In a real app, this would update system password policy
        return NextResponse.json({ 
          success: true,
          updatedPolicy: config.policy
        });
        
      case 'update-encryption-settings':
        // In a real app, this would update encryption configuration
        return NextResponse.json({ 
          success: true,
          updatedSettings: config.settings
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid security action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling security action:', error);
    return NextResponse.json(
      { error: 'Failed to handle security action' }, 
      { status: 500 }
    );
  }
}