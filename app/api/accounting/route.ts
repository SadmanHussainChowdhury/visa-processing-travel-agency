import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Commission from '@/models/Commission';
import Transaction from '@/models/Transaction';

interface Transaction {
  id: string;
  description: string;
  client: string;
  amount: number;
  type: 'revenue' | 'expense';
  category: string;
  date: string;
}

export async function GET() {
  try {
    await dbConnect();
    
    // Get invoices to calculate revenue
    const invoices = await Invoice.find({});

    const totalRevenue = invoices
      .filter(invoice => invoice.status === 'issued' || invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

    const expenseTransactions = await Transaction.find({ type: 'expense' });
    const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const invoiceTransactions: Transaction[] = invoices.map(invoice => ({
      id: invoice._id.toString(),
      description: `Invoice ${invoice.invoiceNumber}`,
      client: invoice.clientName || 'Unknown Client',
      amount: invoice.totalAmount || 0,
      type: 'revenue',
      category: 'Invoices',
      date: invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));
    const expenseTransactionsMapped: Transaction[] = expenseTransactions.map(tx => ({
      id: tx._id.toString(),
      description: tx.description,
      client: tx.clientName || 'Expense',
      amount: tx.amount || 0,
      type: 'expense',
      category: tx.category || 'Expenses',
      date: tx.date
    }));

    const transactions = [...invoiceTransactions, ...expenseTransactionsMapped];
    
    // Get commission data
    const totalCommissionEarned = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: '$commissionEarned' } } }
    ]);
    
    return NextResponse.json({
      transactions,
      totalRevenue,
      totalExpenses,
      netProfit,
      totalCommissionEarned: totalCommissionEarned[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching accounting data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounting data' },
      { status: 500 }
    );
  }
}
