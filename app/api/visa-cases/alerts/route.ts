import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VisaCase from '@/models/VisaCase';

// API endpoint to get all alerts
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    const caseId = searchParams.get('caseId');
    
    let query: any = {};
    
    // Filter by resolved status if specified
    if (resolved !== null) {
      query['alerts.resolved'] = resolved === 'true';
    }
    
    // Filter by severity if specified
    if (severity) {
      query['alerts.severity'] = severity;
    }
    
    // Filter by case ID if specified
    if (caseId) {
      query.caseId = caseId;
    }
    
    const visaCases = await VisaCase.find(query, {
      caseId: 1,
      clientName: 1,
      alerts: 1,
      status: 1
    }).lean();
    
    // Flatten alerts and attach case information
    const allAlerts = [];
    visaCases.forEach(visaCase => {
      visaCase.alerts.forEach((alert: any) => {
        allAlerts.push({
          ...alert,
          caseId: visaCase.caseId,
          clientName: visaCase.clientName,
          caseStatus: visaCase.status
        });
      });
    });
    
    return NextResponse.json(allAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// API endpoint to manually add an alert to a visa case
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { caseId, alert } = body;
    
    if (!caseId || !alert) {
      return NextResponse.json(
        { error: 'Missing required fields: caseId and alert' },
        { status: 400 }
      );
    }

    // Validate alert structure
    if (!alert.type || !alert.message) {
      return NextResponse.json(
        { error: 'Alert must include type and message' },
        { status: 400 }
      );
    }

    const updatedVisaCase = await VisaCase.findOneAndUpdate(
      { caseId },
      { 
        $push: { 
          alerts: {
            ...alert,
            triggeredDate: new Date(),
            resolved: false
          }
        }
      },
      { new: true }
    );

    if (!updatedVisaCase) {
      return NextResponse.json(
        { error: 'Visa case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Alert added successfully',
      visaCase: updatedVisaCase
    });
  } catch (error) {
    console.error('Error adding alert:', error);
    return NextResponse.json(
      { error: 'Failed to add alert' },
      { status: 500 }
    );
  }
}

// API endpoint to update alert resolution status
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { caseId, alertIndex, resolved } = body;
    
    if (!caseId || alertIndex === undefined || resolved === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: caseId, alertIndex, and resolved' },
        { status: 400 }
      );
    }

    const updatedVisaCase = await VisaCase.findOne({ caseId });
    
    if (!updatedVisaCase) {
      return NextResponse.json(
        { error: 'Visa case not found' },
        { status: 404 }
      );
    }

    if (alertIndex < 0 || alertIndex >= updatedVisaCase.alerts.length) {
      return NextResponse.json(
        { error: 'Invalid alert index' },
        { status: 400 }
      );
    }

    // Update the specific alert
    updatedVisaCase.alerts[alertIndex].resolved = resolved;
    if (resolved) {
      updatedVisaCase.alerts[alertIndex].resolvedDate = new Date();
    }

    const savedCase = await VisaCase.findOneAndUpdate(
      { caseId },
      { alerts: updatedVisaCase.alerts },
      { new: true }
    );

    return NextResponse.json({
      message: 'Alert updated successfully',
      visaCase: savedCase
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}