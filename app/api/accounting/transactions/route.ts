import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

interface TransactionInterface {
  id: string;
  description: string;
  client: string;
  amount: number;
  type: 'revenue' | 'expense';
  category: string;
  date: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const invoices = await Invoice.find({}).sort({ createdAt: -1 });

    const allTransactions: TransactionInterface[] = invoices.map(invoice => ({
      id: invoice._id.toString(),
      description: `Invoice ${invoice.invoiceNumber}`,
      client: invoice.clientName || 'Unknown Client',
      amount: invoice.totalAmount || 0,
      type: 'revenue',
      category: 'Invoices',
      date: invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    if (format === 'csv') {
      const csvHeader = ['Transaction ID', 'Description', 'Client', 'Amount', 'Type', 'Category', 'Date'].join(',');
      const csvRows = allTransactions.map(tx => [
        `"${tx.id}"`,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        `"${(tx.client || '').replace(/"/g, '""')}"`,
        `"${tx.amount}"`,
        `"${tx.type}"`,
        `"${tx.category}"`,
        `"${tx.date}"`
      ].join(','));
      const csvContent = [csvHeader, ...csvRows].join('\n');
      const fileName = `accounting_transactions_${new Date().toISOString().slice(0, 10)}.csv`;

      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return response;
    }

    return NextResponse.json(allTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Manual transaction creation is disabled. Transactions are derived from invoices.' },
    { status: 405 }
  );
}
