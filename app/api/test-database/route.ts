import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Appointment from '@/models/Appointment';

export async function GET() {
  try {
    console.log('Testing database connection...');
    await dbConnect();
    console.log('Database connected successfully');

    // Test creating a sample client
    const testClient = new Client({
      firstName: 'Test',
      lastName: 'Client',
      email: 'test@example.com',
      phone: '+1-555-123-4567',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      passportNumber: 'P12345678',
      passportCountry: 'USA',
      visaType: 'tourist',
      visaApplicationDate: new Date(),
      specialRequirements: ['None'],
      currentApplications: ['Tourist Visa Application'],
      travelHistory: ['Previous trips to Canada']
    });

    console.log('Attempting to save test client...');
    const savedClient = await testClient.save();
    console.log('Client saved successfully:', savedClient._id);

    // Test creating a sample appointment
    const testAppointment = new Appointment({
      patientName: 'Test Client',
      patientEmail: 'test@example.com',
      patientPhone: '+1-555-123-4567',
      doctorName: 'Visa Consultant',
      appointmentDate: new Date(),
      appointmentTime: '10:00',
      appointmentType: 'consultation',
      status: 'scheduled',
      reason: 'Visa application consultation'
    });

    console.log('Attempting to save test appointment...');
    const savedAppointment = await testAppointment.save();
    console.log('Appointment saved successfully:', savedAppointment._id);

    // Clean up test data
    await Client.findByIdAndDelete(savedClient._id);
    await Appointment.findByIdAndDelete(savedAppointment._id);
    console.log('Test data cleaned up');

    return NextResponse.json({
      success: true,
      message: 'Database test completed successfully',
      clientId: savedClient._id,
      appointmentId: savedAppointment._id
    });

  } catch (error: any) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}