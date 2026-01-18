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
        const clientData = {
          name: record.Name || record.name || '',
          email: record.Email || record.email || '',
          phone: record.Phone || record.phone || '',
          country: record.Country || record.country || '',
          passportNumber: record['Passport Number'] || record.passportNumber || '',
          dateOfBirth: record['Date of Birth'] || record.dateOfBirth || undefined,
          gender: record.Gender || record.gender || '',
          address: record.Address || record.address || '',
          emergencyContact: record['Emergency Contact'] || record.emergencyContact || '',
          preferredLanguage: record['Preferred Language'] || record.preferredLanguage || '',
          source: record.Source || record.source || 'import',
          status: record.Status || record.status || 'active',
          notes: record.Notes || record.notes || ''
        };

        // Validate required fields
        if (!clientData.name || !clientData.email) {
          throw new Error(`Client name and email are required. Skipping record for ${clientData.name}`);
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