import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { checkAndGenerateDocumentAlerts } from '@/lib/document-alert-service';

export async function GET(request: NextRequest) {
  try {
    // Verify this is coming from a legitimate cron job (you can add authentication here)
    // For now, we'll just check if there's a specific header
    
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_AUTH_TOKEN}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Generate document alerts
    const alerts = await checkAndGenerateDocumentAlerts();
    
    return NextResponse.json({
      message: 'Document alerts checked successfully',
      generatedAlerts: alerts.length
    });
  } catch (error) {
    console.error('Error in document alerts cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This can be used to manually trigger the cron job
    await dbConnect();
    
    // Generate document alerts
    const alerts = await checkAndGenerateDocumentAlerts();
    
    return NextResponse.json({
      message: 'Document alerts checked successfully',
      generatedAlerts: alerts.length
    });
  } catch (error) {
    console.error('Error in document alerts cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}