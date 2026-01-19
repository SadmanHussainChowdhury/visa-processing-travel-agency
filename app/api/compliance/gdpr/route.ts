import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaApplication from '@/models/VisaApplication';
import Compliance from '@/models/Compliance';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get GDPR compliance data
    const totalApplications = await VisaApplication.countDocuments();
    const compliantApplications = await VisaApplication.countDocuments({
      'dataProcessingConsent': true,
      'dataProcessingDate': { $exists: true }
    });
    
    // Get latest GDPR compliance check
    const latestGdprCheck = await Compliance.findOne({ type: 'GDPR' }).sort({ createdAt: -1 });
    
    const gdprData = {
      totalApplications,
      compliantApplications,
      gdprStatus: latestGdprCheck ? latestGdprCheck.status : (totalApplications > 0 ? (compliantApplications === totalApplications ? 'compliant' : 'partial') : 'pending'),
      recordsWithConsent: compliantApplications,
      recordsWithoutConsent: totalApplications - compliantApplications,
      compliancePercentage: totalApplications > 0 ? Math.round((compliantApplications / totalApplications) * 100) : 0,
      lastChecked: latestGdprCheck ? latestGdprCheck.lastChecked.toISOString() : null,
      nextCheck: latestGdprCheck ? latestGdprCheck.nextCheck?.toISOString() : null,
      details: latestGdprCheck ? latestGdprCheck.details : {},
      checkedBy: latestGdprCheck ? latestGdprCheck.checkedBy : 'system'
    };

    return NextResponse.json(gdprData);
  } catch (error) {
    console.error('Error fetching GDPR data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GDPR compliance data' }, 
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
      case 'run-gdpr-check':
        // Run a GDPR compliance check
        const totalApplications = await VisaApplication.countDocuments();
        const compliantApplications = await VisaApplication.countDocuments({
          'dataProcessingConsent': true,
          'dataProcessingDate': { $exists: true }
        });
        
        const gdprStatus = totalApplications > 0 ? 
          (compliantApplications === totalApplications ? 'compliant' : 
          compliantApplications === 0 ? 'non-compliant' : 'partial') : 'pending';
        
        // Create or update GDPR compliance record
        const complianceRecord = await Compliance.findOneAndUpdate(
          { type: 'GDPR' },
          { 
            $set: { 
              status: gdprStatus,
              description: `GDPR compliance check: ${compliantApplications}/${totalApplications} applications compliant`,
              lastChecked: new Date(),
              nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next check in 24 hours
              details: {
                totalApplications,
                compliantApplications,
                compliancePercentage: totalApplications > 0 ? Math.round((compliantApplications / totalApplications) * 100) : 0
              },
              checkedBy: body.userId || 'system'
            }
          },
          { upsert: true, new: true }
        );
        
        return NextResponse.json({
          success: true,
          gdprStatus: complianceRecord.status,
          complianceRecord
        });
        
      case 'update-consent-preferences':
        // Update consent preferences for applications
        if (body.applicationIds && Array.isArray(body.applicationIds)) {
          const result = await VisaApplication.updateMany(
            { _id: { $in: body.applicationIds } },
            { 
              $set: { 
                dataProcessingConsent: body.consent,
                dataProcessingDate: new Date()
              }
            }
          );
          
          return NextResponse.json({
            success: true,
            updatedCount: result.modifiedCount
          });
        }
        
        return NextResponse.json({
          success: false,
          error: 'Missing application IDs'
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid GDPR action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling GDPR action:', error);
    return NextResponse.json(
      { error: 'Failed to handle GDPR action' }, 
      { status: 500 }
    );
  }
}