import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const template = await FormTemplate.findById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Form template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching form template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Check if templateId already exists (excluding current template)
    const existingTemplate = await FormTemplate.findOne({ 
      templateId: body.templateId, 
      _id: { $ne: params.id } 
    });
    
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template ID already exists' },
        { status: 400 }
      );
    }
    
    // Update the form template
    const updatedTemplate = await FormTemplate.findByIdAndUpdate(
      params.id,
      {
        templateId: body.templateId,
        name: body.name,
        country: body.country,
        category: body.category,
        description: body.description || '',
        version: body.version || '2024',
        status: body.status || 'draft',
        fields: body.fields || [],
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedTemplate) {
      return NextResponse.json(
        { error: 'Form template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating form template:', error);
    return NextResponse.json(
      { error: 'Failed to update form template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const deletedTemplate = await FormTemplate.findByIdAndDelete(params.id);
    
    if (!deletedTemplate) {
      return NextResponse.json(
        { error: 'Form template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Form template deleted successfully' });
  } catch (error) {
    console.error('Error deleting form template:', error);
    return NextResponse.json(
      { error: 'Failed to delete form template' },
      { status: 500 }
    );
  }
}