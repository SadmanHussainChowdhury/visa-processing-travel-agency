import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// Define the Lead schema
const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'social_media', 'referral', 'advertisement', 'other']
  },
  status: {
    type: String,
    default: 'new',
    enum: ['new', 'contacted', 'qualified', 'lost', 'converted']
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high']
  },
  assignedTo: {
    type: String,
    default: 'unassigned'
  },
  lastContact: {
    type: String,
    default: null
  },
  nextFollowUp: {
    type: String,
    default: null
  },
  leadScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  countryInterest: {
    type: String,
    default: '',
    trim: true
  },
  visaType: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: 1 });

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Fetch all leads from the database
    const leads = await Lead.find({}).sort({ createdAt: -1 });

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
          `"${lead._id || ''}"`,
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
          `"${lead.createdAt ? new Date(lead.createdAt).toISOString() : ''}"`,
          `"${lead.updatedAt ? new Date(lead.updatedAt).toISOString() : ''}"`
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
    await dbConnect();

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if lead already exists
    const existingLead = await Lead.findOne({ email: body.email });
    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead with this email already exists' },
        { status: 409 }
      );
    }

    // Create new lead
    const newLead = new Lead({
      name: body.name,
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim() || '',
      source: body.source || 'website',
      status: body.status || 'new',
      priority: body.priority || 'medium',
      assignedTo: body.assignedTo || 'unassigned',
      lastContact: body.lastContact || new Date().toISOString().split('T')[0],
      nextFollowUp: body.nextFollowUp || null,
      leadScore: body.leadScore || 50,
      countryInterest: body.countryInterest || '',
      visaType: body.visaType || '',
      notes: body.notes || ''
    });

    await newLead.save();

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
    await dbConnect();

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
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Update the lead
    Object.assign(lead, body);
    lead.updatedAt = new Date();
    
    await lead.save();

    return NextResponse.json({
      message: 'Lead updated successfully',
      lead: lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}