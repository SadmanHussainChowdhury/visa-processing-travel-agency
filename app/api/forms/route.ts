import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';

export async function GET() {
  try {
    await dbConnect();
    
    const templates = await FormTemplate.find({}).sort({ createdAt: -1 });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching form templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.templateId || !body.country || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, templateId, country, category' },
        { status: 400 }
      );
    }
    
    // Check if templateId already exists
    const existingTemplate = await FormTemplate.findOne({ templateId: body.templateId });
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template ID already exists' },
        { status: 400 }
      );
    }
    
    // Create new form template
    const newTemplate = new FormTemplate({
      templateId: body.templateId,
      name: body.name,
      country: body.country,
      category: body.category,
      description: body.description || '',
      version: body.version || '2024',
      status: body.status || 'draft',
      fields: body.fields || []
    });
    
    await newTemplate.save();
    
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating form template:', error);
    return NextResponse.json(
      { error: 'Failed to create form template' },
      { status: 500 }
    );
  }
}