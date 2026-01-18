import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import NotificationTemplate from '@/models/NotificationTemplate';

export async function GET() {
  try {
    await dbConnect();
    
    const templates = await NotificationTemplate.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, content' },
        { status: 400 }
      );
    }
    
    // Check if template name already exists
    const existingTemplate = await NotificationTemplate.findOne({ name: body.name });
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template name already exists' },
        { status: 400 }
      );
    }
    
    // Create new notification template
    const newTemplate = new NotificationTemplate({
      name: body.name,
      type: body.type,
      category: body.category,
      subject: body.subject || '',
      content: body.content,
      variables: body.variables || [],
    });
    
    await newTemplate.save();
    
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating notification template:', error);
    return NextResponse.json(
      { error: 'Failed to create notification template' },
      { status: 500 }
    );
  }
}