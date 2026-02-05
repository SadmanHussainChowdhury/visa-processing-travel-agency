import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Client from '@/models/Client';
import { generateClientsPdf } from '@/lib/pdf-generator';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, excel, pdf

    // Fetch all clients
    const clients = await Client.find({}).sort({ createdAt: -1 });

    if (format === 'json') {
      return NextResponse.json(clients);
    } else if (format === 'csv' || format === 'excel') {
      // Convert to CSV format
      const csvHeader = [
        'Client ID',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Date of Birth',
        'Gender',
        'Address',
        'City',
        'State',
        'Zip Code',
        'Passport Number',
        'Passport Country',
        'Visa Type',
        'Visa Application Date',
        'Visa Expiration Date',
        'Special Requirements',
        'Current Applications',
        'Travel History',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Emergency Contact Relationship',
        'Created At',
        'Updated At'
      ].join(',');

      const csvRows = clients.map(client => {
        const values = [
          `"${client.clientId || client._id || ''}"`,
          `"${(client.firstName || '').replace(/"/g, '""')}"`,
          `"${(client.lastName || '').replace(/"/g, '""')}"`,
          `"${client.email || ''}"`,
          `"${client.phone || ''}"`,
          `"${client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : ''}"`,
          `"${client.gender || ''}"`,
          `"${(client.address || '').replace(/"/g, '""')}"`,
          `"${(client.city || '').replace(/"/g, '""')}"`,
          `"${(client.state || '').replace(/"/g, '""')}"`,
          `"${(client.zipCode || '').replace(/"/g, '""')}"`,
          `"${client.passportNumber || ''}"`,
          `"${client.passportCountry || ''}"`,
          `"${client.visaType || ''}"`,
          `"${client.visaApplicationDate ? new Date(client.visaApplicationDate).toISOString().split('T')[0] : ''}"`,
          `"${client.visaExpirationDate ? new Date(client.visaExpirationDate).toISOString().split('T')[0] : ''}"`,
          `"${(client.specialRequirements || []).join('; ').replace(/"/g, '""')}"`,
          `"${(client.currentApplications || []).join('; ').replace(/"/g, '""')}"`,
          `"${(client.travelHistory || []).join('; ').replace(/"/g, '""')}"`,
          `"${(client.emergencyContact?.name || '').replace(/"/g, '""')}"`,
          `"${(client.emergencyContact?.phone || '').replace(/"/g, '""')}"`,
          `"${(client.emergencyContact?.relationship || '').replace(/"/g, '""')}"`,
          `"${client.createdAt ? new Date(client.createdAt).toISOString() : ''}"`,
          `"${client.updatedAt ? new Date(client.updatedAt).toISOString() : ''}"`
        ];
        return values.join(',');
      });

      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `clients_${new Date().toISOString().slice(0, 10)}.csv`;

      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else if (format === 'pdf') {
      // Generate PDF from HTML content
      const htmlContent = await generateClientsPdf('pdf');
          
      try {
        // For production, you might want to use a headless browser service
        // For now, we'll return the HTML which can be converted to PDF by the frontend
        const fileName = `clients_${new Date().toISOString().slice(0, 10)}.pdf`;
            
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
      return NextResponse.json(clients);
    }
  } catch (error) {
    console.error('Error exporting clients:', error);
    return NextResponse.json(
      { error: 'Failed to export clients' },
      { status: 500 }
    );
  }
}
