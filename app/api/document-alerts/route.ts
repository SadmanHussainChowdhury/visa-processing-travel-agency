import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DocumentAlert from '@/models/DocumentAlert';
import { createDocumentAlertsFromService, checkAndGenerateDocumentAlerts } from '@/lib/document-alert-service';

export async function GET() {
  try {
    await dbConnect();
    
    const alerts = await DocumentAlert.find({})
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching document alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // If the request is to generate alerts from document management
    if (body.action === 'generate-from-documents') {
      const generatedAlerts = await checkAndGenerateDocumentAlerts();
      return NextResponse.json({
        message: `Generated ${generatedAlerts.length} alerts from document management`,
        count: generatedAlerts.length
      });
    }
    
    // Otherwise, validate required fields for manual alert creation
    if (!body.clientId || !body.documentType || !body.alertType || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, documentType, alertType, message' },
        { status: 400 }
      );
    }
    
    // Create new document alert
    const newAlert = new DocumentAlert({
      clientId: body.clientId,
      documentType: body.documentType,
      documentId: body.documentId,
      alertType: body.alertType,
      message: body.message,
      priority: body.priority || 'medium',
      status: 'active',
      dueDate: body.dueDate,
      expirationDate: body.expirationDate,
    });
    
    await newAlert.save();
    
    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating document alert:', error);
    return NextResponse.json(
      { error: 'Failed to create document alert' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { alertId, status } = body;
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'Missing required field: alertId' },
        { status: 400 }
      );
    }
    
    const updatedAlert = await DocumentAlert.findByIdAndUpdate(
      alertId,
      { status },
      { new: true }
    );
    
    if (!updatedAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error('Error updating document alert:', error);
    return NextResponse.json(
      { error: 'Failed to update document alert' },
      { status: 500 }
    );
  }
}