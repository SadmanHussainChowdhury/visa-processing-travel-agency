import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaCase from '@/models/VisaCase';
import Client from '@/models/Client';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { id } = params;

    // Get specific visa case with client information
    const visaCase = await VisaCase.findById(id)
      .populate('clientId', 'name')
      .exec();

    if (!visaCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Transform the case to the format expected by the frontend
    const transformedCase = {
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
    };

    return NextResponse.json(transformedCase);
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Find the visa case by ID
    const visaCase = await VisaCase.findById(id);
    if (!visaCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Update the case with new data
    const updatedCase = await VisaCase.findByIdAndUpdate(
      id,
      {
        $set: {
          status: body.status || visaCase.status,
          submissionDate: body.submissionDate || visaCase.submissionDate,
          notes: body.notes || visaCase.notes,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate('clientId', 'name');

    // Transform the updated case to the format expected by the frontend
    const transformedCase = {
      id: updatedCase._id.toString(),
      caseId: updatedCase.caseId || `VC-${updatedCase._id.toString().substring(0, 8).toUpperCase()}`,
      clientName: updatedCase.clientName || (updatedCase.clientId as any)?.name || 'Unknown Client',
      visaType: updatedCase.visaType || 'Unknown',
      country: updatedCase.country || 'Unknown',
      status: updatedCase.status || 'draft',
      embassySubmissionDate: updatedCase.submissionDate || undefined,
      embassy: updatedCase.submissionDate ? `${updatedCase.country} Embassy` : undefined,
      timeline: [
        {
          id: `event-${updatedCase._id}-created`,
          date: updatedCase.createdAt?.toISOString() || new Date().toISOString(),
          status: 'submitted',
          title: 'Application Created',
          description: 'Initial application created in the system',
          submittedBy: 'System'
        },
        ...(updatedCase.submissionDate ? [{
          id: `event-${updatedCase._id}-submitted`,
          date: updatedCase.submissionDate?.toISOString() || new Date().toISOString(),
          status: 'submitted',
          title: 'Submitted to Embassy',
          description: `Application submitted to ${updatedCase.country} Embassy`,
          embassy: `${updatedCase.country} Embassy`,
          submittedBy: 'Agent'
        }] : []),
        ...(updatedCase.status === 'approved' ? [{
          id: `event-${updatedCase._id}-approved`,
          date: updatedCase.updatedAt?.toISOString() || new Date().toISOString(),
          status: 'approved',
          title: 'Visa Approved',
          description: `Visa approved by ${updatedCase.country} Embassy`,
          embassy: `${updatedCase.country} Embassy`,
          submittedBy: 'System'
        }] : []),
        ...(updatedCase.status === 'rejected' ? [{
          id: `event-${updatedCase._id}-rejected`,
          date: updatedCase.updatedAt?.toISOString() || new Date().toISOString(),
          status: 'rejected',
          title: 'Visa Rejected',
          description: `Visa rejected by ${updatedCase.country} Embassy`,
          embassy: `${updatedCase.country} Embassy`,
          submittedBy: 'System'
        }] : [])
      ],
      internalNotes: updatedCase.notes || [],
      createdAt: updatedCase.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: updatedCase.updatedAt?.toISOString() || new Date().toISOString()
    };

    return NextResponse.json(transformedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}