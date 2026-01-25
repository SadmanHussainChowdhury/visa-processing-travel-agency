import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaCase from '@/models/VisaCase';
import Client from '@/models/Client';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all visa cases with client information
    const cases = await VisaCase.find({})
      .populate('clientId', 'name')
      .sort({ createdAt: -1 });

    // Transform the cases to the format expected by the frontend
    const transformedCases = cases.map(visaCase => ({
      id: visaCase._id.toString(),
      caseId: visaCase.caseId || `VC-${visaCase._id.toString().substring(0, 8).toUpperCase()}`,
      clientName: visaCase.clientName || (visaCase.clientId as any)?.name || 'Unknown Client',
      visaType: visaCase.visaType || 'Unknown',
      country: visaCase.country || 'Unknown',
      status: visaCase.status || 'draft',
      embassySubmissionDate: visaCase.submissionDate || undefined,
      embassy: visaCase.submissionDate ? `${visaCase.country} Embassy` : undefined,
      timeline: [
        {
          id: `event-${visaCase._id}-created`,
          date: visaCase.createdAt?.toISOString() || new Date().toISOString(),
          status: 'submitted',
          title: 'Application Created',
          description: 'Initial application created in the system',
          submittedBy: 'System'
        },
        ...(visaCase.submissionDate ? [{
          id: `event-${visaCase._id}-submitted`,
          date: visaCase.submissionDate?.toISOString() || new Date().toISOString(),
          status: 'submitted',
          title: 'Submitted to Embassy',
          description: `Application submitted to ${visaCase.country} Embassy`,
          embassy: `${visaCase.country} Embassy`,
          submittedBy: 'Agent'
        }] : []),
        ...(visaCase.status === 'approved' ? [{
          id: `event-${visaCase._id}-approved`,
          date: visaCase.updatedAt?.toISOString() || new Date().toISOString(),
          status: 'approved',
          title: 'Visa Approved',
          description: `Visa approved by ${visaCase.country} Embassy`,
          embassy: `${visaCase.country} Embassy`,
          submittedBy: 'System'
        }] : []),
        ...(visaCase.status === 'rejected' ? [{
          id: `event-${visaCase._id}-rejected`,
          date: visaCase.updatedAt?.toISOString() || new Date().toISOString(),
          status: 'rejected',
          title: 'Visa Rejected',
          description: `Visa rejected by ${visaCase.country} Embassy`,
          embassy: `${visaCase.country} Embassy`,
          submittedBy: 'System'
        }] : [])
      ],
      internalNotes: visaCase.notes || [],
      createdAt: visaCase.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: visaCase.updatedAt?.toISOString() || new Date().toISOString()
    }));

    return NextResponse.json(transformedCases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.clientId || !body.visaType || !body.country) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, visaType, country' },
        { status: 400 }
      );
    }

    // Create new case
    const newCase = new VisaCase({
      clientId: body.clientId,
      clientName: body.clientName,
      clientEmail: body.clientEmail || '',
      visaType: body.visaType,
      country: body.country,
      status: body.status || 'draft',
      submissionDate: body.submissionDate,
      applicationDate: body.applicationDate || new Date(),
      expectedDecisionDate: body.expectedDecisionDate,
      priority: body.priority || 'medium',
      notes: body.notes || []
    });

    await newCase.save();

    // Populate the client information for the response
    await newCase.populate('clientId', 'name');

    const transformedCase = {
      id: newCase._id.toString(),
      caseId: newCase.caseId || `VC-${newCase._id.toString().substring(0, 8).toUpperCase()}`,
      clientName: newCase.clientName || (newCase.clientId as any)?.name || 'Unknown Client',
      visaType: newCase.visaType || 'Unknown',
      country: newCase.country || 'Unknown',
      status: newCase.status || 'draft',
      embassySubmissionDate: newCase.submissionDate || undefined,
      embassy: newCase.submissionDate ? `${newCase.country} Embassy` : undefined,
      timeline: [
        {
          id: `event-${newCase._id}-created`,
          date: newCase.createdAt?.toISOString() || new Date().toISOString(),
          status: 'submitted',
          title: 'Application Created',
          description: 'Initial application created in the system',
          submittedBy: 'System'
        }
      ],
      internalNotes: newCase.notes || [],
      createdAt: newCase.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: newCase.updatedAt?.toISOString() || new Date().toISOString()
    };

    return NextResponse.json(transformedCase, { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}