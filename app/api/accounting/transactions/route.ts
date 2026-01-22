import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VisaApplication from '@/models/VisaApplication';
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

export async function GET() {
  try {
    await dbConnect();
    
    // Get all applications to create transaction data from visa applications
    const applications = await VisaApplication.find({}).populate('clientId');
    
    // Create transaction data from applications
    const applicationTransactions: TransactionInterface[] = applications
      .filter(app => (app.fee || app.applicationFee || app.serviceFee || 0) > 0)
      .map(app => ({
        id: app._id.toString(),
        description: `Visa Application - ${app.visaType || 'General'}`,
        client: app.clientId?.name || app.clientName || 'Unknown Client',
        amount: app.fee || app.applicationFee || app.serviceFee || 0,
        type: 'revenue',
        category: 'Application Fees',
        date: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    
    // Get additional transactions from the Transaction model
    const additionalTransactions = await Transaction.find({}).populate('clientId');
    
    // Map additional transactions to the same interface
    const additionalTransactionData: TransactionInterface[] = additionalTransactions.map(tx => ({
      id: tx._id.toString(),
      description: tx.description,
      client: tx.clientName,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date
    }));
    
    // Combine both sets of transactions
    const allTransactions = [...applicationTransactions, ...additionalTransactionData];
    
    // Sort by date descending
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
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
    
    // Validate required fields
    if (!body.description || !body.amount || !body.type || !body.category || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: description, amount, type, category, date' },
        { status: 400 }
      );
    }
    
    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero' },
        { status: 400 }
      );
    }
    
    // Validate transaction type
    if (!['revenue', 'expense'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be either revenue or expense' },
        { status: 400 }
      );
    }
    
    // Create new transaction
    const newTransaction = new Transaction({
      description: body.description,
      clientId: body.clientId,
      clientName: body.clientName || 'Unknown Client',
      amount: body.amount,
      type: body.type,
      category: body.category,
      date: body.date,
      applicationId: body.applicationId,
      userId: body.userId,
      notes: body.notes || ''
    });
    
    await newTransaction.save();
    
    return NextResponse.json(
      { message: 'Transaction created successfully', transaction: newTransaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}