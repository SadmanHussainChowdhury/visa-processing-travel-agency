import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaCase from '@/models/VisaCase';
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
        // Find client by email or create a new one if needed
        let client = await Client.findOne({ email: record['Client Email'] || record.clientEmail });
        
        if (!client && record['Client Name'] && record['Client Email']) {
          // Create client if it doesn't exist
          client = new Client({
            name: record['Client Name'] || record.clientName,
            email: record['Client Email'] || record.clientEmail,
            phone: record['Client Phone'] || record.clientPhone || '',
            source: 'import'
          });
          await client.save();
        } else if (!client) {
          throw new Error(`Client with email ${record['Client Email'] || record.clientEmail} not found and insufficient data to create`);
        }

        // Prepare visa case data from CSV record
        const visaCaseData = {
          caseId: record['Case ID'] || record.caseId || '',
          clientId: client._id,
          clientName: client.name,
          clientEmail: client.email,
          visaType: record['Visa Type'] || record.visaType || '',
          country: record.Country || record.country || '',
          status: record.Status || record.status || 'draft',
          priority: record.Priority || record.priority || 'medium',
          applicationDate: record['Application Date'] || record.applicationDate || new Date(),
          submissionDate: record['Submission Date'] || record.submissionDate || undefined,
          expectedDecisionDate: record['Expected Decision Date'] || record.expectedDecisionDate || undefined,
          notes: record.Notes || record.notes ? [record.Notes || record.notes] : []
        };

        // Validate required fields
        if (!visaCaseData.visaType || !visaCaseData.country) {
          throw new Error(`Visa type and country are required. Skipping record for ${client.name}`);
        }

        // Check if case already exists
        if (visaCaseData.caseId) {
          const existingCase = await VisaCase.findOne({ caseId: visaCaseData.caseId });
          if (existingCase) {
            throw new Error(`Visa case with ID ${visaCaseData.caseId} already exists`);
          }
        }

        // Create new visa case
        const newVisaCase = new VisaCase(visaCaseData);
        await newVisaCase.save();
        importedCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(err.message || `Error processing record: ${JSON.stringify(record)}`);
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${importedCount} applications`,
      importedCount,
      errorCount,
      errors
    });
  } catch (error) {
    console.error('Error importing applications:', error);
    return NextResponse.json(
      { error: 'Failed to import applications' },
      { status: 500 }
    );
  }
}