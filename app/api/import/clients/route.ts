import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Client from '@/models/Client';
import { parse } from 'csv-parse/sync';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    // Read and parse the file
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    
    // Parse CSV
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true
    });

    let importedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const record of records) {
      try {
        // Prepare client data from CSV record
        const fullName = record.Name || record.name || '';
        const nameParts = String(fullName).trim().split(/\s+/);
        const firstName = record['First Name'] || record.firstName || nameParts[0] || '';
        const rawLastName = record['Last Name'] || record.lastName || nameParts.slice(1).join(' ');
        const lastName = rawLastName || 'Unknown';
        const genderRaw = String(record.Gender || record.gender || '').toLowerCase();
        const normalizedGender = ['male', 'female', 'other', 'prefer-not-to-say'].includes(genderRaw)
          ? genderRaw
          : genderRaw === 'prefer not to say'
            ? 'prefer-not-to-say'
            : '';
        const emergencyName = record['Emergency Contact Name'] || record.emergencyContactName || '';
        const emergencyPhone = record['Emergency Contact Phone'] || record.emergencyContactPhone || '';
        const emergencyRelationship = record['Emergency Contact Relationship'] || record.emergencyContactRelationship || '';
        const specialRequirements = record['Special Requirements'] || record.specialRequirements || '';
        const currentApplications = record['Current Applications'] || record.currentApplications || '';
        const travelHistory = record['Travel History'] || record.travelHistory || '';

        const clientData = {
          clientId: record['Client ID'] || record.clientId || undefined,
          firstName,
          lastName,
          email: record.Email || record.email || '',
          phone: record.Phone || record.phone || '',
          dateOfBirth: record['Date of Birth'] || record.dateOfBirth || undefined,
          gender: normalizedGender,
          address: record.Address || record.address || '',
          city: record.City || record.city || '',
          state: record.State || record.state || '',
          zipCode: record['Zip Code'] || record.zipCode || '',
          passportNumber: record['Passport Number'] || record.passportNumber || '',
          passportCountry: record['Passport Country'] || record.passportCountry || '',
          visaType: record['Visa Type'] || record.visaType || '',
          visaApplicationDate: record['Visa Application Date'] || record.visaApplicationDate || record['Application Date'] || record.applicationDate || undefined,
          visaExpirationDate: record['Visa Expiration Date'] || record.visaExpirationDate || undefined,
          specialRequirements: String(specialRequirements || '')
            .split(';')
            .map((item: string) => item.trim())
            .filter(Boolean),
          currentApplications: String(currentApplications || '')
            .split(';')
            .map((item: string) => item.trim())
            .filter(Boolean),
          travelHistory: String(travelHistory || '')
            .split(';')
            .map((item: string) => item.trim())
            .filter(Boolean),
          emergencyContact: {
            name: emergencyName,
            phone: emergencyPhone,
            relationship: emergencyRelationship
          }
        };

        // Validate required fields
        if (!clientData.firstName || !clientData.lastName || !clientData.email || !clientData.phone) {
          throw new Error(`First name, last name, email, and phone are required. Skipping record for ${clientData.email || 'unknown email'}`);
        }
        if (!clientData.dateOfBirth || !clientData.gender) {
          throw new Error(`Date of birth and gender are required. Skipping record for ${clientData.email}`);
        }
        if (!clientData.passportNumber || !clientData.passportCountry || !clientData.visaType || !clientData.visaApplicationDate) {
          throw new Error(`Passport number, passport country, visa type, and visa application date are required. Skipping record for ${clientData.email}`);
        }

        // Check if client already exists
        const existingClient = await Client.findOne({ email: clientData.email });
        if (existingClient) {
          throw new Error(`Client with email ${clientData.email} already exists`);
        }

        // Create new client
        const newClient = new Client(clientData);
        await newClient.save();
        importedCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(err.message || `Error processing record: ${JSON.stringify(record)}`);
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${importedCount} clients`,
      importedCount,
      errorCount,
      errors
    });
  } catch (error) {
    console.error('Error importing clients:', error);
    return NextResponse.json(
      { error: 'Failed to import clients' },
      { status: 500 }
    );
  }
}
