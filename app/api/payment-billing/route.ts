import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import FeeStructure from '@/models/FeeStructure';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all invoices
    const invoices = await Invoice.find({}).sort({ createdAt: -1 }).limit(10).lean();
    
    // Get all payments
    const payments = await Payment.find({}).sort({ createdAt: -1 }).limit(10).lean();
    
    // Get all fee structures
    const feeStructures = await FeeStructure.find({}).sort({ createdAt: -1 }).lean();
    
    // Calculate overview metrics
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const invoicesSent = invoices.filter(i => i.status === 'sent').length;
    const invoicesPaid = invoices.filter(i => i.status === 'paid').length;

    const paymentData = {
      totalRevenue,
      pendingPayments,
      invoicesSent,
      invoicesPaid,
      invoicesCount: invoices.length,
      paymentsCount: payments.length,
      feeStructuresCount: feeStructures.length,
      recentInvoices: invoices.map(inv => ({
        id: inv._id.toString(),
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        totalAmount: inv.totalAmount,
        currency: inv.currency,
        status: inv.status,
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate.toISOString()
      })),
      recentPayments: payments.map(pay => ({
        id: pay._id.toString(),
        invoiceNumber: pay.invoiceNumber,
        clientName: pay.clientName,
        amount: pay.amount,
        currency: pay.currency,
        status: pay.status,
        method: pay.method,
        date: pay.date.toISOString()
      }))
    };

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Error fetching payment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment data' }, 
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
        // Validate required fields
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

      case 'update-invoice-status':
        if (!body.invoiceId || !body.status) {
          return NextResponse.json(
            { error: 'Missing invoiceId or status' }, 
            { status: 400 }
          );
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(
          body.invoiceId,
          { status: body.status },
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
            status: updatedInvoice.status
          }
        });

      case 'process-payment':
        if (!body.invoiceId || !body.amount || !body.method || !body.gateway) {
          return NextResponse.json(
            { error: 'Missing required fields for payment processing' }, 
            { status: 400 }
          );
        }

        // Get invoice to process payment
        const invoice = await Invoice.findById(body.invoiceId);
        if (!invoice) {
          return NextResponse.json(
            { error: 'Invoice not found' }, 
            { status: 404 }
          );
        }

        // Create payment record
        const newPayment = new Payment({
          invoiceId: body.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          amount: body.amount,
          currency: body.currency || invoice.currency,
          status: 'completed', // Default to completed for successful processing
          method: body.method,
          transactionId: body.transactionId || `txn_${Date.now()}`,
          gateway: body.gateway,
          metadata: body.metadata || {}
        });

        await newPayment.save();

        // Update invoice status to paid
        await Invoice.findByIdAndUpdate(body.invoiceId, { status: 'paid' });

        return NextResponse.json({ 
          success: true, 
          payment: {
            id: newPayment._id.toString(),
            invoiceId: newPayment.invoiceId,
            amount: newPayment.amount,
            status: newPayment.status
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling payment action:', error);
    return NextResponse.json(
      { error: 'Failed to handle payment action' }, 
      { status: 500 }
    );
  }
}