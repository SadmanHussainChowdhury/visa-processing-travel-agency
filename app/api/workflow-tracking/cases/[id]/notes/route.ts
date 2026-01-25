import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaCase from '@/models/VisaCase';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.note) {
      return NextResponse.json(
        { error: 'Missing required field: note' },
        { status: 400 }
      );
    }

    // Find the visa case by ID
    const visaCase = await VisaCase.findById(id);
    if (!visaCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Add the note to the case
    const updatedNotes = [...(visaCase.notes || []), body.note];

    // Update the case with the new note
    const updatedCase = await VisaCase.findByIdAndUpdate(
      id,
      {
        $set: {
          notes: updatedNotes,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Note added successfully',
      notes: updatedCase?.notes || []
    });
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    );
  }
}