import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Transaction from '@/models/Transaction';

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
    const expenses = await Transaction.find({ type: 'expense' }).sort({ date: -1 });

    const invoiceTransactions: TransactionInterface[] = invoices.map(invoice => ({
      id: invoice._id.toString(),
      description: `Invoice ${invoice.invoiceNumber}`,
      client: invoice.clientName || 'Unknown Client',
      amount: invoice.totalAmount || 0,
      type: 'revenue',
      category: 'Invoices',
      date: invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    const expenseTransactions: TransactionInterface[] = expenses.map(tx => ({
      id: tx._id.toString(),
      description: tx.description,
      client: tx.clientName || 'Expense',
      amount: tx.amount || 0,
      type: 'expense',
      category: tx.category || 'Expenses',
      date: tx.date
    }));

    const allTransactions = [...invoiceTransactions, ...expenseTransactions];

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
  try {
    await dbConnect();

    const body = await request.json();

    if (!body.description || !body.amount || !body.category || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: description, amount, category, date' },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero' },
        { status: 400 }
      );
    }

    const newTransaction = new Transaction({
      description: body.description,
      clientId: body.clientId,
      clientName: body.clientName || 'Expense',
      amount,
      type: 'expense',
      category: body.category,
      date: body.date,
      notes: body.notes || ''
    });

    await newTransaction.save();

    return NextResponse.json(
      { message: 'Expense created successfully', transaction: newTransaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create expense transaction' },
      { status: 500 }
    );
  }
}
