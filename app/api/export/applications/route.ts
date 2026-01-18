import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaCase from '@/models/VisaCase';
import { generateApplicationsPdf } from '@/lib/pdf-generator';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, excel, pdf

    // Fetch all visa cases (applications)
    const applications = await VisaCase.find({})
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 });

    if (format === 'json') {
      return NextResponse.json(applications);
    } else if (format === 'csv' || format === 'excel') {
      // Convert to CSV format
      const csvHeader = [
        'Case ID',
        'Client Name',
        'Client Email',
        'Client Phone',
        'Visa Type',
        'Country',
        'Application Date',
        'Submission Date',
        'Expected Decision Date',
        'Priority',
        'Status',
        'Notes',
        'Created At',
        'Updated At'
      ].join(',');
    
      const csvRows = applications.map(application => {
        const values = [
          `"${application.caseId || ''}"`,
          `"${(application.clientName || '').replace(/"/g, '""')}"`,
          `"${application.clientEmail || ''}"`,
          `"${application.clientId?.phone || ''}"`,
          `"${application.visaType || ''}"`,
          `"${application.country || ''}"`,
          `"${application.applicationDate ? new Date(application.applicationDate).toISOString().split('T')[0] : ''}"`,
          `"${application.submissionDate ? new Date(application.submissionDate).toISOString().split('T')[0] : ''}"`,
          `"${application.expectedDecisionDate ? new Date(application.expectedDecisionDate).toISOString().split('T')[0] : ''}"`,
          `"${application.priority || ''}"`,
          `"${application.status || ''}"`,
          `"${(application.notes?.join(', ') || '').replace(/"/g, '""')}"`,
          `"${application.createdAt ? new Date(application.createdAt).toISOString() : ''}"`,
          `"${application.updatedAt ? new Date(application.updatedAt).toISOString() : ''}"`
        ];
        return values.join(',');
      });
    
      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `applications_${new Date().toISOString().slice(0, 10)}.csv`;
    
      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else if (format === 'pdf') {
      // Generate PDF from HTML content
      const htmlContent = await generateApplicationsPdf('pdf');
              
      try {
        // For production, you might want to use a headless browser service
        // For now, we'll return the HTML which can be converted to PDF by the frontend
        const fileName = `applications_${new Date().toISOString().slice(0, 10)}.pdf`;
                
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
      return NextResponse.json(applications);
    }
  } catch (error) {
    console.error('Error exporting applications:', error);
    return NextResponse.json(
      { error: 'Failed to export applications' },
      { status: 500 }
    );
  }
}