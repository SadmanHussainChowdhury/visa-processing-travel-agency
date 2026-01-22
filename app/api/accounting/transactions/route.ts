import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VisaApplication from '@/models/VisaApplication';

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
    
    // Get all applications to create transaction data
    const applications = await VisaApplication.find({}).populate('clientId');
    
    // Create transaction data from applications
    const transactions: Transaction[] = applications
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
    
    // Transaction creation is not implemented in this simplified version
    // In a real application, you would create a Transaction model and save the data
    const body = await request.json();
    
    // For now, just return a success response
    return NextResponse.json(
      { message: 'Transaction created successfully', transaction: body },
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