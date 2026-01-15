import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VisaCase from '@/models/VisaCase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const visaCase = await VisaCase.findById(params.id);
    
    if (!visaCase) {
      return NextResponse.json(
        { error: 'Visa case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(visaCase);
  } catch (error) {
    console.error('Error fetching visa case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa case' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Remove assignment fields if they exist (since we're removing assignment functionality)
    const { assignedAgent, assignedTeam, ...updatedBody } = body;

    // Update the visa case
    const updatedVisaCase = await VisaCase.findByIdAndUpdate(
      params.id,
      updatedBody,
      { new: true, runValidators: true }
    );

    if (!updatedVisaCase) {
      return NextResponse.json(
        { error: 'Visa case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVisaCase);
  } catch (error) {
    console.error('Error updating visa case:', error);
    return NextResponse.json(
      { error: 'Failed to update visa case' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const deletedVisaCase = await VisaCase.findByIdAndDelete(params.id);

    if (!deletedVisaCase) {
      return NextResponse.json(
        { error: 'Visa case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Visa case deleted successfully' });
  } catch (error) {
    console.error('Error deleting visa case:', error);
    return NextResponse.json(
      { error: 'Failed to delete visa case' },
      { status: 500 }
    );
  }
}