import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Document from '@/models/Document';
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
        // Prepare document data from CSV record
        const documentData = {
          documentId: record['Document ID'] || record.documentId || '',
          fileName: record['File Name'] || record.fileName || '',
          originalName: record['Original Name'] || record.originalName || '',
          fileType: record['File Type'] || record.fileType || '',
          fileSize: parseInt(record['File Size']) || 0,
          mimeType: record['Mime Type'] || record.mimeType || '',
          url: record.URL || record.url || '',
          clientId: record['Client ID'] || record.clientId || '',
          clientName: record['Client Name'] || record.clientName || '',
          visaCaseId: record['Visa Case ID'] || record.visaCaseId || '',
          category: record.Category || record.category || 'other',
          status: record.Status || record.status || 'pending',
          uploadedBy: record['Uploaded By'] || record.uploadedBy || 'system',
          uploadedAt: record['Uploaded At'] || record.uploadedAt || new Date(),
          expiryDate: record['Expiry Date'] || record.expiryDate || undefined,
          version: parseInt(record.Version) || 1
        };

        // Validate required fields
        if (!documentData.fileName || !documentData.url) {
          throw new Error(`File name and URL are required. Skipping record for ${documentData.fileName}`);
        }

        // Check if document already exists
        const existingDocument = await Document.findOne({ documentId: documentData.documentId });
        if (existingDocument) {
          throw new Error(`Document with ID ${documentData.documentId} already exists`);
        }

        // Create new document
        const newDocument = new Document(documentData);
        await newDocument.save();
        importedCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(err.message || `Error processing record: ${JSON.stringify(record)}`);
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${importedCount} documents`,
      importedCount,
      errorCount,
      errors
    });
  } catch (error) {
    console.error('Error importing documents:', error);
    return NextResponse.json(
      { error: 'Failed to import documents' },
      { status: 500 }
    );
  }
}