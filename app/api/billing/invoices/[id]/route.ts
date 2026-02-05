import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
// Authentication not required for billing API routes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    
    // Check if invoice exists
    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Prevent editing finalized invoices (paid or cancelled)
    if (existingInvoice.status === 'paid' || existingInvoice.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot edit paid or cancelled invoices' },
        { status: 400 }
      );
    }

    // Recalculate totals if items are updated
    let updateData = { ...body };
    
    if (body.items && Array.isArray(body.items)) {
      let subtotal = 0;
      body.items.forEach((item: any) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        item.amount = quantity * unitPrice;
        subtotal += item.amount;
      });
      
      const taxRate = body.taxRate !== undefined ? Number(body.taxRate) || 0 : existingInvoice.taxRate;
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;
      const depositAmount = body.depositAmount !== undefined ? Math.max(0, Number(body.depositAmount) || 0) : (existingInvoice.depositAmount || 0);
      const dueAmount = Math.max(0, totalAmount - depositAmount);
      
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.totalAmount = totalAmount;
      updateData.depositAmount = depositAmount;
      updateData.dueAmount = dueAmount;
    }

    if (!body.items && body.depositAmount !== undefined) {
      const totalAmount = existingInvoice.totalAmount || 0;
      const depositAmount = Math.max(0, Number(body.depositAmount) || 0);
      updateData.depositAmount = depositAmount;
      updateData.dueAmount = Math.max(0, totalAmount - depositAmount);
    }

    // Handle status transitions
    if (body.status) {
      const validTransitions = {
        'draft': ['issued', 'cancelled'],
        'issued': ['paid', 'cancelled'],
        'paid': [],
        'cancelled': []
      };
      
      if (!validTransitions[existingInvoice.status].includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${existingInvoice.status} to ${body.status}` },
          { status: 400 }
        );
      }

      // Set dates based on status
      if (body.status === 'issued' && !existingInvoice.issuedDate) {
        updateData.issuedDate = new Date();
      } else if (body.status === 'paid' && !existingInvoice.paidDate) {
        updateData.paidDate = new Date();
      } else if (body.status === 'cancelled' && !existingInvoice.cancelledDate) {
        updateData.cancelledDate = new Date();
      }
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of finalized invoices
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot delete paid or cancelled invoices' },
        { status: 400 }
      );
    }

    await Invoice.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
