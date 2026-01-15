import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET() {
  try {
    await dbConnect();
    const clients = await Client.find({}).sort({ createdAt: -1 });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');
    const body = await request.json();
    
    // Debug: Log the incoming data
    console.log('Incoming client data:', JSON.stringify(body, null, 2));
    
    // Helper function to safely convert date strings to Date objects
    const safeDateConvert = (dateStr: string) => {
      if (!dateStr) return undefined;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? undefined : date;
    };
    
    // Clean up the data: convert empty strings to undefined for optional fields
    const cleanedData: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone ? body.phone.trim() : '',
      dateOfBirth: safeDateConvert(body.dateOfBirth),
      gender: body.gender || '',
      passportNumber: body.passportNumber,
      passportCountry: body.passportCountry,
      visaType: body.visaType,
      visaApplicationDate: safeDateConvert(body.visaApplicationDate),
      specialRequirements: body.specialRequirements || [],
      currentApplications: body.currentApplications || [],
      travelHistory: body.travelHistory || []
    };
    
    if (body.address && body.address.trim()) {
      cleanedData.address = body.address.trim();
    }
    if (body.city && body.city.trim()) {
      cleanedData.city = body.city.trim();
    }
    if (body.state && body.state.trim()) {
      cleanedData.state = body.state.trim();
    }
    if (body.zipCode && body.zipCode.trim()) {
      cleanedData.zipCode = body.zipCode.trim();
    }
    if (body.visaExpirationDate && body.visaExpirationDate.trim()) {
      const visaExpDate = safeDateConvert(body.visaExpirationDate);
      if (visaExpDate) {
        cleanedData.visaExpirationDate = visaExpDate;
      }
    }
    
    // Handle emergency contact - only include if at least one field has a value
    if (body.emergencyContact) {
      const emergencyContact: any = {};
      if (body.emergencyContact.name && body.emergencyContact.name.trim()) {
        emergencyContact.name = body.emergencyContact.name.trim();
      }
      if (body.emergencyContact.phone && body.emergencyContact.phone.trim()) {
        emergencyContact.phone = body.emergencyContact.phone.trim();
      }
      if (body.emergencyContact.relationship && body.emergencyContact.relationship.trim()) {
        emergencyContact.relationship = body.emergencyContact.relationship.trim();
      }
      
      // Only add emergencyContact if it has at least one field
      if (Object.keys(emergencyContact).length > 0) {
        cleanedData.emergencyContact = emergencyContact;
      }
    }
    
    console.log('Cleaned client data:', JSON.stringify(cleanedData, null, 2));
    
    // Generate a unique clientId if not provided
    if (!cleanedData.clientId) {
      const firstName = cleanedData.firstName?.substring(0, 2).toUpperCase() || 'XX';
      const lastName = cleanedData.lastName?.substring(0, 2).toUpperCase() || 'XX';
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      
      // Make sure the generated ID is unique
      let candidateId = `${firstName}${lastName}${timestamp}`;
      let counter = 1;
      let existingClient;
      
      do {
        existingClient = await Client.findOne({ clientId: candidateId });
        if (existingClient) {
          candidateId = `${firstName}${lastName}${timestamp}${counter.toString().padStart(2, '0')}`;
          counter++;
        }
      } while (existingClient && counter <= 100); // Prevent infinite loop
      
      cleanedData.clientId = candidateId;
    }
    
    const client = new Client(cleanedData);
    
    // Validate the client before saving
    const validationError = client.validateSync();
    if (validationError) {
      console.error('Validation error details:', validationError);
      const errorMessages: string[] = [];
      if (validationError.errors) {
        Object.keys(validationError.errors).forEach(key => {
          errorMessages.push(`${key}: ${validationError.errors[key].message}`);
        });
      }
      return NextResponse.json({ 
        error: 'Client validation failed', 
        details: errorMessages.length > 0 ? errorMessages.join(', ') : validationError.message 
      }, { status: 400 });
    }
    
    console.log('About to save client...');
    await client.save();
    console.log('Client saved successfully:', client._id);
    
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    
    // Handle duplicate key error (e.g., duplicate email)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ 
        error: 'Duplicate entry',
        details: `${field} already exists`
      }, { status: 400 });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages: string[] = [];
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          errorMessages.push(`${key}: ${error.errors[key].message}`);
        });
      }
      return NextResponse.json({ 
        error: 'Client validation failed', 
        details: errorMessages.length > 0 ? errorMessages.join(', ') : error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create client',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}