import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET() {
  try {
    await dbConnect();
    const appointments = await Appointment.find({}).sort({ appointmentDate: -1 });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Map client-related field names to appointment model fields
    const mappedData = {
      clientName: body.clientName || body.patientName,
      clientEmail: body.clientEmail || body.patientEmail,
      clientPhone: body.clientPhone || body.patientPhone,
      consultantName: body.consultantName || body.doctorName || 'Visa Consultant',
      consultantEmail: body.consultantEmail || body.doctorEmail,
      
      // Appointment fields (keep as is)
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      appointmentType: body.appointmentType || 'consultation', // Default to 'consultation' for visa appointments
      status: body.status || 'scheduled',
      reason: body.purpose || body.reason, // Map purpose to reason
      notes: body.notes,
      requirements: body.requirements || body.symptoms,
      consultationNotes: body.consultationNotes || body.diagnosis,
      recommendations: body.recommendations || body.treatment,
      clientId: body.clientId || body.patientId // Ensure clientId is mapped properly (only once)
    };

    const appointment = new Appointment(mappedData);
    await appointment.save();
    
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}