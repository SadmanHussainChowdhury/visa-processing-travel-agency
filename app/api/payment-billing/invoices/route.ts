import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all invoices
    const invoices = await Invoice.find({}).sort({ createdAt: -1 }).lean();

    const invoiceData = {
      invoices: invoices.map(inv => ({
        id: inv._id.toString(),
        invoiceNumber: inv.invoiceNumber,
        clientId: inv.clientId,
        clientName: inv.clientName,
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        totalAmount: inv.totalAmount,
        currency: inv.currency,
        status: inv.status,
        items: inv.items.map(item => ({
          id: item._id ? item._id.toString() : '',
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        notes: inv.notes,
        createdAt: inv.createdAt.toISOString(),
        updatedAt: inv.updatedAt.toISOString()
      }))
    };

    return NextResponse.json(invoiceData);
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { action } = body;

    switch(action) {
      case 'create-invoice':
        if (!body.clientId || !body.clientName || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
          return NextResponse.json(
            { error: 'Missing required fields for invoice creation' }, 
            { status: 400 }
          );
        }

        // Calculate total amount
        const totalAmount = body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

        // Create invoice number
        const invoiceCount = await Invoice.countDocuments();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

        // Create the invoice
        const newInvoice = new Invoice({
          invoiceNumber,
          clientId: body.clientId,
          clientName: body.clientName,
          issueDate: new Date(),
          dueDate: body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
          totalAmount,
          currency: body.currency || 'USD',
          status: 'draft',
          items: body.items,
          notes: body.notes || ''
        });

        await newInvoice.save();

        return NextResponse.json({ 
          success: true, 
          invoice: {
            id: newInvoice._id.toString(),
            invoiceNumber: newInvoice.invoiceNumber,
            clientName: newInvoice.clientName,
            totalAmount: newInvoice.totalAmount,
            currency: newInvoice.currency,
            status: newInvoice.status
          }
        });

      case 'update-invoice':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Invoice ID is required for update' }, 
            { status: 400 }
          );
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(
          body.id,
          { 
            clientId: body.clientId,
            clientName: body.clientName,
            issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            totalAmount: body.totalAmount,
            currency: body.currency,
            status: body.status,
            items: body.items,
            notes: body.notes
          },
          { new: true }
        );

        if (!updatedInvoice) {
          return NextResponse.json(
            { error: 'Invoice not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          invoice: {
            id: updatedInvoice._id.toString(),
            invoiceNumber: updatedInvoice.invoiceNumber,
            clientName: updatedInvoice.clientName,
            totalAmount: updatedInvoice.totalAmount,
            currency: updatedInvoice.currency,
            status: updatedInvoice.status
          }
        });

      case 'delete-invoice':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Invoice ID is required for deletion' }, 
            { status: 400 }
          );
        }

        const deletedInvoice = await Invoice.findByIdAndDelete(body.id);

        if (!deletedInvoice) {
          return NextResponse.json(
            { error: 'Invoice not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true,
          message: 'Invoice deleted successfully'
        });

      case 'send-invoice':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Invoice ID is required for sending' }, 
            { status: 400 }
          );
        }

        const sentInvoice = await Invoice.findByIdAndUpdate(
          body.id,
          { status: 'sent' },
          { new: true }
        );

        if (!sentInvoice) {
          return NextResponse.json(
            { error: 'Invoice not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          invoice: {
            id: sentInvoice._id.toString(),
            status: sentInvoice.status
          }
        });

      case 'mark-paid':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Invoice ID is required for marking as paid' }, 
            { status: 400 }
          );
        }

        const paidInvoice = await Invoice.findByIdAndUpdate(
          body.id,
          { status: 'paid' },
          { new: true }
        );

        if (!paidInvoice) {
          return NextResponse.json(
            { error: 'Invoice not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          invoice: {
            id: paidInvoice._id.toString(),
            status: paidInvoice.status
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling invoice action:', error);
    return NextResponse.json(
      { error: 'Failed to handle invoice action' }, 
      { status: 500 }
    );
  }
}