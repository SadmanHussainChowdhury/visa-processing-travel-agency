import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaApplication from '@/models/VisaApplication';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get GDPR compliance data
    const totalApplications = await VisaApplication.countDocuments();
    const compliantApplications = await VisaApplication.countDocuments({
      'dataProcessingConsent': true,
      'dataProcessingDate': { $exists: true }
    });

    const gdprData = {
      totalApplications,
      compliantApplications,
      gdprStatus: totalApplications > 0 ? (compliantApplications === totalApplications ? 'compliant' : 'partial') : 'pending',
      recordsWithConsent: compliantApplications,
      recordsWithoutConsent: totalApplications - compliantApplications,
      compliancePercentage: totalApplications > 0 ? Math.round((compliantApplications / totalApplications) * 100) : 0
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