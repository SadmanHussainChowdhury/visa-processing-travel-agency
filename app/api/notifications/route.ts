import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    await dbConnect();
    
    const notifications = await Notification.find({})
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, content' },
        { status: 400 }
      );
    }
    
    // Create new notification
    const newNotification = new Notification({
      type: body.type,
      status: 'pending',
      subject: body.subject || '',
      content: body.content,
      recipients: body.recipients || [],
      priority: body.priority || 'medium',
      sendTime: body.sendTime || 'immediate',
      clientId: body.clientId,
      sentAt: new Date()
    });
    
    await newNotification.save();
    
    // In a real implementation, we would send the actual notification here
    // For now, we'll just update the status to 'sent'
    newNotification.status = 'sent';
    await newNotification.save();
    
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}