import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VisaTransaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    let filter: any = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;

    const transactions = await VisaTransaction.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      transactions: transactions.map((t: any) => ({
        id: t._id.toString(),
        transactionId: t.transactionId,
        invoiceId: t.invoiceId,
        invoiceNumber: t.invoiceNumber,
        clientName: t.clientName,
        amount: t.amount,
        currency: t.currency,
        type: t.type,
        description: t.description,
        status: t.status,
        method: t.method,
        gateway: t.gateway,
        date: t.date.toISOString(),
        processedBy: t.processedBy,
        notes: t.notes
      }))
    });
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
    await connectDB();

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create-transaction':
        const newTransaction = new VisaTransaction({
          transactionId: `TRX-${Date.now()}`,
          ...data,
          date: data.date || new Date()
        });

        await newTransaction.save();

        return NextResponse.json({ 
          success: true, 
          transaction: {
            id: newTransaction._id.toString(),
            transactionId: newTransaction.transactionId,
            invoiceId: newTransaction.invoiceId,
            invoiceNumber: newTransaction.invoiceNumber,
            clientName: newTransaction.clientName,
            amount: newTransaction.amount,
            currency: newTransaction.currency,
            type: newTransaction.type,
            description: newTransaction.description,
            status: newTransaction.status,
            method: newTransaction.method,
            gateway: newTransaction.gateway,
            date: newTransaction.date.toISOString(),
            processedBy: newTransaction.processedBy,
            notes: newTransaction.notes
          }
        });

      case 'update-transaction':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Transaction ID is required for update' }, 
            { status: 400 }
          );
        }

        const updatedTransaction = await VisaTransaction.findByIdAndUpdate(
          body.id,
          { ...data },
          { new: true }
        );

        if (!updatedTransaction) {
          return NextResponse.json(
            { error: 'Transaction not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          transaction: {
            id: updatedTransaction._id.toString(),
            transactionId: updatedTransaction.transactionId,
            invoiceId: updatedTransaction.invoiceId,
            invoiceNumber: updatedTransaction.invoiceNumber,
            clientName: updatedTransaction.clientName,
            amount: updatedTransaction.amount,
            currency: updatedTransaction.currency,
            type: updatedTransaction.type,
            description: updatedTransaction.description,
            status: updatedTransaction.status,
            method: updatedTransaction.method,
            gateway: updatedTransaction.gateway,
            date: updatedTransaction.date.toISOString(),
            processedBy: updatedTransaction.processedBy,
            notes: updatedTransaction.notes
          }
        });

      case 'delete-transaction':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Transaction ID is required for deletion' }, 
            { status: 400 }
          );
        }

        const deletedTransaction = await VisaTransaction.findByIdAndDelete(body.id);

        if (!deletedTransaction) {
          return NextResponse.json(
            { error: 'Transaction not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true,
          message: 'Transaction deleted successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling transaction action:', error);
    return NextResponse.json(
      { error: 'Failed to handle transaction action' }, 
      { status: 500 }
    );
  }
}