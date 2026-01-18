import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Transaction from '@/models/Transaction';
import Commission from '@/models/Commission';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, excel, pdf

    // Fetch all transactions and commissions for report data
    const transactions = await Transaction.find({}).sort({ createdAt: -1 });
    const commissions = await Commission.find({}).sort({ createdAt: -1 });

    // Combine or process data as needed for reports
    const reportData = {
      transactions,
      commissions,
      summary: {
        totalTransactions: transactions.length,
        totalRevenue: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        totalCommissions: commissions.length,
        totalCommissionAmount: commissions.reduce((sum, c) => sum + (c.amount || 0), 0),
      }
    };

    if (format === 'json') {
      return NextResponse.json(reportData);
    } else if (format === 'csv' || format === 'excel') {
      // Convert to CSV format - this would be more complex in a real application
      // For simplicity, we'll return transaction data
      const csvHeader = [
        'Transaction ID',
        'Amount',
        'Type',
        'Description',
        'Date',
        'Category',
        'CreatedBy',
        'CreatedAt'
      ].join(',');

      const csvRows = transactions.map(transaction => {
        const values = [
          `"${transaction.transactionId || ''}"`,
          `"${transaction.amount || 0}"`,
          `"${transaction.type || ''}"`,
          `"${(transaction.description || '').replace(/"/g, '""')}"`,
          `"${transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : ''}"`,
          `"${transaction.category || ''}"`,
          `"${transaction.createdBy || ''}"`,
          `"${transaction.createdAt ? new Date(transaction.createdAt).toISOString() : ''}"`
        ];
        return values.join(',');
      });

      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `reports_${new Date().toISOString().slice(0, 10)}.csv`;

      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
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