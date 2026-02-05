import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    // Delete all invoices
    const result = await Invoice.deleteMany({});
    
    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} invoices`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing invoices:', error);
    return NextResponse.json(
      { error: 'Failed to clear invoices' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get invoice count and sample data
    const count = await Invoice.countDocuments();
    const sampleInvoices = await Invoice.find({}, { invoiceNumber: 1, clientName: 1, status: 1, createdAt: 1 }).limit(5);
    
    return NextResponse.json({
      count,
      sampleInvoices
    });
  } catch (error) {
    console.error('Error fetching invoice info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice information' },
      { status: 500 }
    );
  }
}