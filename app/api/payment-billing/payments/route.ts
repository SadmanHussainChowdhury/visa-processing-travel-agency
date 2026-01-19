import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all payments
    const payments = await Payment.find({}).sort({ createdAt: -1 }).lean();

    const paymentData = {
      payments: payments.map(pay => ({
        id: pay._id.toString(),
        invoiceId: pay.invoiceId,
        invoiceNumber: pay.invoiceNumber,
        clientName: pay.clientName,
        amount: pay.amount,
        currency: pay.currency,
        status: pay.status,
        method: pay.method,
        transactionId: pay.transactionId,
        date: pay.date.toISOString(),
        gateway: pay.gateway,
        metadata: pay.metadata,
        createdAt: pay.createdAt.toISOString(),
        updatedAt: pay.updatedAt.toISOString()
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
      case 'create-payment':
        if (!body.invoiceId || !body.amount || !body.method || !body.gateway) {
          return NextResponse.json(
            { error: 'Missing required fields for payment creation' }, 
            { status: 400 }
          );
        }

        // Get invoice to process payment
        console.log('Looking for invoice with ID:', body.invoiceId);
        const invoice = await Invoice.findById(body.invoiceId);
        console.log('Found invoice:', invoice ? 'Yes' : 'No');
        if (!invoice) {
          console.log('Invoice not found for ID:', body.invoiceId);
          // If the invoice doesn't exist, we'll create a payment anyway but with placeholder data
          const newPayment = new Payment({
            invoiceId: body.invoiceId,
            invoiceNumber: `INV-${Date.now()}`, // Generate a temporary invoice number
            clientName: 'Unknown Client',
            amount: body.amount,
            currency: body.currency || 'USD',
            status: body.status || 'completed',
            method: body.method,
            transactionId: body.transactionId || `txn_${Date.now()}`,
            gateway: body.gateway,
            metadata: body.metadata || {}
          });

          await newPayment.save();

          return NextResponse.json({ 
            success: true, 
            payment: {
              id: newPayment._id.toString(),
              invoiceId: newPayment.invoiceId,
              invoiceNumber: newPayment.invoiceNumber,
              clientName: newPayment.clientName,
              amount: newPayment.amount,
              status: newPayment.status,
              method: newPayment.method,
              transactionId: newPayment.transactionId,
              date: newPayment.date.toISOString()
            }
          });
        }

        // Create payment record
        const newPayment = new Payment({
          invoiceId: body.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          amount: body.amount,
          currency: body.currency || invoice.currency,
          status: body.status || 'completed', // Default to completed for successful processing
          method: body.method,
          transactionId: body.transactionId || `txn_${Date.now()}`,
          gateway: body.gateway,
          metadata: body.metadata || {}
        });

        await newPayment.save();

        // Update invoice status to paid if payment is completed
        if (body.status === 'completed') {
          await Invoice.findByIdAndUpdate(body.invoiceId, { status: 'paid' });
        }

        return NextResponse.json({ 
          success: true, 
          payment: {
            id: newPayment._id.toString(),
            invoiceId: newPayment.invoiceId,
            invoiceNumber: newPayment.invoiceNumber,
            clientName: newPayment.clientName,
            amount: newPayment.amount,
            status: newPayment.status,
            method: newPayment.method,
            transactionId: newPayment.transactionId,
            date: newPayment.date.toISOString()
          }
        });

      case 'update-payment':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Payment ID is required for update' }, 
            { status: 400 }
          );
        }

        const updatedPayment = await Payment.findByIdAndUpdate(
          body.id,
          { 
            amount: body.amount,
            currency: body.currency,
            status: body.status,
            method: body.method,
            transactionId: body.transactionId,
            gateway: body.gateway,
            metadata: body.metadata
          },
          { new: true }
        );

        if (!updatedPayment) {
          return NextResponse.json(
            { error: 'Payment not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          payment: {
            id: updatedPayment._id.toString(),
            invoiceId: updatedPayment.invoiceId,
            invoiceNumber: updatedPayment.invoiceNumber,
            clientName: updatedPayment.clientName,
            amount: updatedPayment.amount,
            status: updatedPayment.status,
            method: updatedPayment.method,
            transactionId: updatedPayment.transactionId,
            date: updatedPayment.date.toISOString()
          }
        });

      case 'delete-payment':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Payment ID is required for deletion' }, 
            { status: 400 }
          );
        }

        const deletedPayment = await Payment.findByIdAndDelete(body.id);

        if (!deletedPayment) {
          return NextResponse.json(
            { error: 'Payment not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true,
          message: 'Payment deleted successfully'
        });

      case 'refund-payment':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Payment ID is required for refund' }, 
            { status: 400 }
          );
        }

        const refundedPayment = await Payment.findByIdAndUpdate(
          body.id,
          { status: 'refunded' },
          { new: true }
        );

        if (!refundedPayment) {
          return NextResponse.json(
            { error: 'Payment not found' }, 
            { status: 404 }
          );
        }

        // Update invoice status back to unpaid if payment was refunded
        if (refundedPayment.status === 'completed') {
          await Invoice.findByIdAndUpdate(refundedPayment.invoiceId, { status: 'sent' });
        }

        return NextResponse.json({ 
          success: true, 
          payment: {
            id: refundedPayment._id.toString(),
            status: refundedPayment.status
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