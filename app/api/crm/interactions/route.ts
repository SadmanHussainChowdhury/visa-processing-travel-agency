import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// Define the Interaction schema
const interactionSchema = new mongoose.Schema({
  leadId: {
    type: String,
    required: true
  },
  leadName: {
    type: String,
    required: true
  },
  date: {
    type: String, // Using String to avoid timezone issues
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['call', 'email', 'meeting', 'message', 'visit']
  },
  outcome: {
    type: String,
    default: 'contacted',
    enum: ['contacted', 'replied', 'met', 'no_response', 'interested', 'not_interested']
  },
  notes: {
    type: String,
    default: ''
  },
  duration: {
    type: String, // Duration in format like "15 mins"
    default: ''
  },
  agent: {
    type: String,
    default: 'Unknown'
  }
}, {
  timestamps: true
});

// Index for efficient querying
interactionSchema.index({ leadId: 1 });
interactionSchema.index({ date: 1 });
interactionSchema.index({ type: 1 });

const Interaction = mongoose.models.Interaction || mongoose.model('Interaction', interactionSchema);

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId') || '';
    
    let query = {};
    if (leadId) {
      query = { leadId };
    }

    // Fetch interactions from the database
    const interactions = await Interaction.find(query).sort({ date: -1 });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate required fields
    if (!body.leadId || !body.date || !body.type) {
      return NextResponse.json(
        { error: 'Lead ID, date, and type are required' },
        { status: 400 }
      );
    }

    // Create new interaction
    const newInteraction = new Interaction({
      leadId: body.leadId,
      leadName: body.leadName || 'Unknown',
      date: body.date,
      type: body.type,
      outcome: body.outcome || 'contacted',
      notes: body.notes || '',
      duration: body.duration || '',
      agent: body.agent || 'Unknown'
    });

    await newInteraction.save();

    return NextResponse.json(
      { message: 'Interaction recorded successfully', interaction: newInteraction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    );
  }
}