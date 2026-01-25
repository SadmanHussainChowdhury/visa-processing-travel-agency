import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Commission from '@/models/Commission';
import { generateReportsPdf } from '@/lib/pdf-generator';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, excel, pdf

    // Fetch commissions for report data (transactions are no longer available)
    const commissions = await Commission.find({}).sort({ createdAt: -1 });

    // Combine or process data as needed for reports
    const reportData = {
      transactions: [], // No transaction data available
      commissions,
      summary: {
        totalTransactions: 0, // No transaction data available
        totalRevenue: 0, // No transaction data available
        totalCommissions: commissions.length,
        totalCommissionAmount: commissions.reduce((sum, c) => sum + (c.amount || 0), 0),
      }
    };

    if (format === 'json') {
      return NextResponse.json(reportData);
    } else if (format === 'csv' || format === 'excel') {
      // Convert to CSV format - since transactions are no longer available, return commissions instead
      const csvHeader = [
        'Commission ID',
        'Amount',
        'Type',
        'Description',
        'Date',
        'Agent',
        'CreatedBy',
        'CreatedAt'
      ].join(',');
      
      const csvRows = commissions.map(commission => {
        const values = [
          `"${commission._id || ''}"`,
          `"${commission.amount || 0}"`,
          `"${commission.type || ''}"`,
          `"${(commission.description || '').replace(/"/g, '\\"')}"`,
          `"${commission.date ? new Date(commission.date).toISOString().split('T')[0] : ''}"`,
          `"${commission.agent || ''}"`,
          `"${commission.createdBy || ''}"`,
          `"${commission.createdAt ? new Date(commission.createdAt).toISOString() : ''}"`
        ];
        return values.join(',');
      });

      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `reports_${new Date().toISOString().slice(0, 10)}.csv`;

      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    } else if (format === 'pdf') {
      // Generate PDF from HTML content
      const htmlContent = await generateReportsPdf('pdf');
          
      try {
        // For production, you might want to use a headless browser service
        // For now, we'll return the HTML which can be converted to PDF by the frontend
        const fileName = `reports_${new Date().toISOString().slice(0, 10)}.pdf`;
            
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
      return NextResponse.json(reportData);
    }
  } catch (error) {
    console.error('Error exporting reports:', error);
    return NextResponse.json(
      { error: 'Failed to export reports' },
      { status: 500 }
    );
  }
}