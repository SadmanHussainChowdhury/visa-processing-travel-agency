import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    await dbConnect();
    
    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 transactions
    
    return NextResponse.json(transactions);
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
    if (!body.description || !body.amount || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: description, amount, category' },
        { status: 400 }
      );
    }
    
    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Validate transaction type
    if (!['revenue', 'expense'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type. Must be "revenue" or "expense"' },
        { status: 400 }
      );
    }
    
    // Create new transaction
    const newTransaction = new Transaction({
      date: body.date || new Date(),
      type: body.type,
      description: body.description,
      amount: body.amount,
      category: body.category,
      client: body.clientId ? { id: body.clientId, name: body.clientName } : null,
      notes: body.notes || ''
    });
    
    await newTransaction.save();
    
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}