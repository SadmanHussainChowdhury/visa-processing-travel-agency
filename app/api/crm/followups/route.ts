import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// Define the FollowUp schema
const followUpSchema = new mongoose.Schema({
  leadId: {
    type: String,
    required: true
  },
  leadName: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: String, // Using String to avoid timezone issues
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['call', 'email', 'meeting', 'message']
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed', 'cancelled']
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
followUpSchema.index({ leadId: 1 });
followUpSchema.index({ status: 1 });
followUpSchema.index({ scheduledDate: 1 });

const FollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', followUpSchema);

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    
    let query = {};
    if (status) {
      query = { status };
    }

    // Fetch follow-ups from the database
    const followUps = await FollowUp.find(query).sort({ scheduledDate: 1 });

    return NextResponse.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow-ups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate required fields
    if (!body.leadId || !body.scheduledDate || !body.type) {
      return NextResponse.json(
        { error: 'Lead ID, scheduled date, and type are required' },
        { status: 400 }
      );
    }

    // Create new follow-up
    const newFollowUp = new FollowUp({
      leadId: body.leadId,
      leadName: body.leadName || 'Unknown',
      scheduledDate: body.scheduledDate,
      type: body.type,
      status: body.status || 'pending',
      notes: body.notes || ''
    });

    await newFollowUp.save();

    return NextResponse.json(
      { message: 'Follow-up created successfully', followUp: newFollowUp },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to create follow-up' },
      { status: 500 }
    );
  }
}