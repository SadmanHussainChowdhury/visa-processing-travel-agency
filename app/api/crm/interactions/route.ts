import { NextRequest, NextResponse } from 'next/server';

// Mock data for interaction history
let interactions = [
  {
    id: 'ih-001',
    leadId: 'lead-001',
    leadName: 'John Smith',
    date: '2024-01-10',
    type: 'call',
    outcome: 'contacted',
    notes: 'Discussed Australia tourist visa requirements. Sent information.',
    duration: '15 mins',
    agent: 'Agent 1',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: 'ih-002',
    leadId: 'lead-002',
    leadName: 'Sarah Johnson',
    date: '2024-01-08',
    type: 'email',
    outcome: 'replied',
    notes: 'Responded to inquiry about Canadian student visa requirements.',
    duration: '',
    agent: 'Agent 2',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId') || '';
    
    let filteredInteractions = interactions;
    if (leadId) {
      filteredInteractions = interactions.filter(interaction => interaction.leadId === leadId);
    }

    return NextResponse.json(filteredInteractions);
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
    const body = await request.json();
    
    // Validate required fields
    if (!body.leadId || !body.date || !body.type) {
      return NextResponse.json(
        { error: 'Lead ID, date, and type are required' },
        { status: 400 }
      );
    }

    // Create new interaction
    const newInteraction = {
      id: `ih-${Date.now()}`,
      leadId: body.leadId,
      leadName: body.leadName || 'Unknown',
      date: body.date,
      type: body.type,
      outcome: body.outcome || 'contacted',
      notes: body.notes || '',
      duration: body.duration || '',
      agent: body.agent || 'Unknown',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    interactions.push(newInteraction);

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