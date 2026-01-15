import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VisaCase from '@/models/VisaCase';

// API endpoint to check and trigger reminders
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Find all visa cases with pending reminders
    const now = new Date();
    const visaCases = await VisaCase.find({
      'reminders.dueDate': { $lte: now },
      'reminders.completed': false
    });

    const triggeredReminders = [];

    // Process each case and update reminders that are due
    for (const visaCase of visaCases) {
      const updatedReminders = visaCase.reminders.map((reminder: any) => {
        if (reminder.dueDate <= now && !reminder.completed) {
          // Mark reminder as triggered/completed
          reminder.completed = true;
          reminder.completedDate = now;
          
          // Add alert for the reminder
          const alert = {
            type: 'deadline-warning',
            message: `Reminder: ${reminder.message}`,
            severity: 'warning',
            triggeredDate: now,
            resolved: false
          };
          
          visaCase.alerts.push(alert);
          triggeredReminders.push({
            caseId: visaCase.caseId,
            reminder: reminder.message,
            clientId: visaCase.clientId
          });
        }
        return reminder;
      });

      // Update the visa case with completed reminders and new alerts
      await VisaCase.findByIdAndUpdate(
        visaCase._id,
        { 
          reminders: updatedReminders,
          alerts: visaCase.alerts
        },
        { new: true }
      );
    }

    return NextResponse.json({
      message: 'Reminders checked successfully',
      triggeredRemindersCount: triggeredReminders.length,
      triggeredReminders
    });
  } catch (error) {
    console.error('Error checking reminders:', error);
    return NextResponse.json(
      { error: 'Failed to check reminders' },
      { status: 500 }
    );
  }
}

// API endpoint to manually add a reminder to a visa case
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { caseId, reminder } = body;
    
    if (!caseId || !reminder) {
      return NextResponse.json(
        { error: 'Missing required fields: caseId and reminder' },
        { status: 400 }
      );
    }

    // Validate reminder structure
    if (!reminder.type || !reminder.message || !reminder.dueDate) {
      return NextResponse.json(
        { error: 'Reminder must include type, message, and dueDate' },
        { status: 400 }
      );
    }

    const updatedVisaCase = await VisaCase.findOneAndUpdate(
      { caseId },
      { 
        $push: { 
          reminders: {
            ...reminder,
            completed: false,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedVisaCase) {
      return NextResponse.json(
        { error: 'Visa case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Reminder added successfully',
      visaCase: updatedVisaCase
    });
  } catch (error) {
    console.error('Error adding reminder:', error);
    return NextResponse.json(
      { error: 'Failed to add reminder' },
      { status: 500 }
    );
  }
}