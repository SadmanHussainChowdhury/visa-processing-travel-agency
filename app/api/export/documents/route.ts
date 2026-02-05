import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Document from '@/models/Document';
import { generateDocumentsPdf } from '@/lib/pdf-generator';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, excel, pdf

    // Fetch all documents
    const documents = await Document.find({}).sort({ createdAt: -1 });

    if (format === 'json') {
      return NextResponse.json(documents);
    } else if (format === 'csv' || format === 'excel') {
      // Convert to CSV format
      const csvHeader = [
        'Document ID',
        'File Name',
        'Original Name',
        'File Type',
        'File Size',
        'Mime Type',
        'File Path',
        'URL',
        'Client ID',
        'Client Name',
        'Visa Case ID',
        'Category',
        'Status',
        'Uploaded By',
        'Uploaded At',
        'Expiry Date',
        'Version',
        'Created At',
        'Updated At'
      ].join(',');

      const csvRows = documents.map(document => {
        const values = [
          `"${document.documentId || ''}"`,
          `"${(document.fileName || '').replace(/"/g, '""')}"`,
          `"${(document.originalName || '').replace(/"/g, '""')}"`,
          `"${document.fileType || ''}"`,
          `"${document.fileSize || ''}"`,
          `"${document.mimeType || ''}"`,
          `"${document.filePath || ''}"`,
          `"${document.url || ''}"`,
          `"${document.clientId || ''}"`,
          `"${(document.clientName || '').replace(/"/g, '""')}"`,
          `"${document.visaCaseId || ''}"`,
          `"${document.category || ''}"`,
          `"${document.status || ''}"`,
          `"${document.uploadedBy || ''}"`,
          `"${document.uploadedAt ? new Date(document.uploadedAt).toISOString() : ''}"`,
          `"${document.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : ''}"`,
          `"${document.version || ''}"`,
          `"${document.createdAt ? new Date(document.createdAt).toISOString() : ''}"`,
          `"${document.updatedAt ? new Date(document.updatedAt).toISOString() : ''}"`
        ];
        return values.join(',');
      });

      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `documents_${new Date().toISOString().slice(0, 10)}.csv`;

      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else if (format === 'pdf') {
      // Generate PDF from HTML content
      const htmlContent = await generateDocumentsPdf('pdf');
          
      try {
        // For production, you might want to use a headless browser service
        // For now, we'll return the HTML which can be converted to PDF by the frontend
        const fileName = `documents_${new Date().toISOString().slice(0, 10)}.pdf`;
            
        // Return HTML content with instructions for PDF conversion
        const response = new NextResponse(htmlContent);
        response.headers.set('Content-Type', 'text/html');
        response.headers.set('Content-Disposition', `attachment; filename="${fileName.replace('.pdf', '.html')}"`);
        return response;
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        // Fallback to returning HTML
        const response = new NextResponse(htmlContent);
        response.headers.set('Content-Type', 'text/html');
        return response;
      }
    } else {
      // Default to JSON
      return NextResponse.json(documents);
    }
  } catch (error) {
    console.error('Error exporting documents:', error);
    return NextResponse.json(
      { error: 'Failed to export documents' },
      { status: 500 }
    );
  }
}
