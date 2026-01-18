import { NextRequest, NextResponse } from 'next/server';

// Mock data for follow-ups
let followUps = [
  {
    id: 'fu-001',
    leadId: 'lead-001',
    leadName: 'John Smith',
    scheduledDate: '2024-01-15',
    type: 'call',
    status: 'pending',
    notes: 'Follow up on Australia tourist visa inquiry',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: 'fu-002',
    leadId: 'lead-002',
    leadName: 'Sarah Johnson',
    scheduledDate: '2024-01-12',
    type: 'email',
    status: 'completed',
    notes: 'Sent university information for Canada study programs',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    
    let filteredFollowUps = followUps;
    if (status) {
      filteredFollowUps = followUps.filter(fu => fu.status === status);
    }

    return NextResponse.json(filteredFollowUps);
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
    const body = await request.json();
    
    // Validate required fields
    if (!body.leadId || !body.scheduledDate || !body.type) {
      return NextResponse.json(
        { error: 'Lead ID, scheduled date, and type are required' },
        { status: 400 }
      );
    }

    // Create new follow-up
    const newFollowUp = {
      id: `fu-${Date.now()}`,
      leadId: body.leadId,
      leadName: body.leadName || 'Unknown',
      scheduledDate: body.scheduledDate,
      type: body.type,
      status: body.status || 'pending',
      notes: body.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    followUps.push(newFollowUp);

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