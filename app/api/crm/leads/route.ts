import { NextRequest, NextResponse } from 'next/server';

// Mock data for leads
let leads = [
  {
    id: 'lead-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    source: 'website',
    status: 'new',
    priority: 'high',
    assignedTo: 'Agent 1',
    lastContact: '2024-01-10',
    nextFollowUp: '2024-01-15',
    leadScore: 85,
    countryInterest: 'Australia',
    visaType: 'Tourist',
    notes: 'Interested in family visit visa for Australia',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10'
  },
  {
    id: 'lead-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 987-6543',
    source: 'social_media',
    status: 'contacted',
    priority: 'medium',
    assignedTo: 'Agent 2',
    lastContact: '2024-01-08',
    nextFollowUp: '2024-01-12',
    leadScore: 70,
    countryInterest: 'Canada',
    visaType: 'Student',
    notes: 'Looking for study visa options in Canada',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-08'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (format === 'json') {
      return NextResponse.json(leads);
    } else if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'Source',
        'Status',
        'Priority',
        'Assigned To',
        'Last Contact',
        'Next Follow Up',
        'Lead Score',
        'Country Interest',
        'Visa Type',
        'Notes',
        'Created At',
        'Updated At'
      ].join(',');

      const csvRows = leads.map(lead => {
        const values = [
          `"${lead.id || ''}"`,
          `"${(lead.name || '').replace(/"/g, '""')}"`,
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.source || ''}"`,
          `"${lead.status || ''}"`,
          `"${lead.priority || ''}"`,
          `"${lead.assignedTo || ''}"`,
          `"${lead.lastContact || ''}"`,
          `"${lead.nextFollowUp || ''}"`,
          `"${lead.leadScore || 0}"`,
          `"${(lead.countryInterest || '').replace(/"/g, '""')}"`,
          `"${(lead.visaType || '').replace(/"/g, '""')}"`,
          `"${(lead.notes || '').replace(/"/g, '""')}"`,
          `"${lead.createdAt || ''}"`,
          `"${lead.updatedAt || ''}"`
        ];
        return values.join(',');
      });

      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `leads_${new Date().toISOString().slice(0, 10)}.csv`;

      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else {
      // Default to JSON
      return NextResponse.json(leads);
    }
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if lead already exists
    const existingLead = leads.find(lead => lead.email === body.email);
    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead with this email already exists' },
        { status: 409 }
      );
    }

    // Create new lead
    const newLead = {
      id: `lead-${Date.now()}`,
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone || '',
      source: body.source || 'website',
      status: body.status || 'new',
      priority: body.priority || 'medium',
      assignedTo: body.assignedTo || 'unassigned',
      lastContact: body.lastContact || new Date().toISOString().split('T')[0],
      nextFollowUp: body.nextFollowUp || null,
      leadScore: body.leadScore || 50,
      countryInterest: body.countryInterest || '',
      visaType: body.visaType || '',
      notes: body.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    leads.push(newLead);

    return NextResponse.json(
      { message: 'Lead created successfully', lead: newLead },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Find the lead to update
    const leadIndex = leads.findIndex(lead => lead.id === leadId);
    
    if (leadIndex === -1) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Update the lead
    leads[leadIndex] = {
      ...leads[leadIndex],
      ...body,
      id: leadId, // Ensure the ID stays the same
      updatedAt: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      message: 'Lead updated successfully',
      lead: leads[leadIndex]
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}