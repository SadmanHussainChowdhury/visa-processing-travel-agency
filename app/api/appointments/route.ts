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
    
    // Map visa-specific field names to medical field names expected by the model
    const mappedData = {
      // Client/Visa fields -> Patient/Doctor fields
      patientName: body.clientName || body.patientName,
      patientEmail: body.clientEmail || body.patientEmail,
      patientPhone: body.clientPhone || body.patientPhone,
      doctorName: body.consultantName || body.doctorName || 'Visa Consultant',
      doctorEmail: body.consultantEmail || body.doctorEmail,
      
      // Appointment fields (keep as is)
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      appointmentType: body.appointmentType || 'consultation', // Default to 'consultation' for visa appointments
      patientId: body.clientId || body.patientId, // Ensure patientId is mapped properly
      status: body.status || 'scheduled',
      reason: body.purpose || body.reason, // Map purpose to reason
      notes: body.notes,
      
      // Keep other fields as they are
      patientId: body.clientId || body.patientId,
      symptoms: body.symptoms,
      diagnosis: body.diagnosis,
      treatment: body.treatment
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