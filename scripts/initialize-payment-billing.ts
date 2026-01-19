import mongoose from 'mongoose';
import { dbConnect } from '../lib/db';
import FeeStructure from '../models/FeeStructure';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';

async function initializePaymentBilling() {
  try {
    await dbConnect();
    
    console.log('Initializing Payment & Billing data...');
    
    // Check if fee structures already exist
    const existingFeeStructures = await FeeStructure.countDocuments();
    if (existingFeeStructures === 0) {
      // Create sample fee structures
      const feeStructures = [
        {
          name: 'Tourist Visa',
          governmentFee: 160,
          serviceFee: 50,
          currency: 'USD',
          description: 'Standard tourist visa processing'
        },
        {
          name: 'Business Visa',
          governmentFee: 190,
          serviceFee: 75,
          currency: 'USD',
          description: 'Business visa with expedited processing'
        },
        {
          name: 'Student Visa',
          governmentFee: 180,
          serviceFee: 60,
          currency: 'USD',
          description: 'Student visa with documentation support'
        },
        {
          name: 'Transit Visa',
          governmentFee: 90,
          serviceFee: 30,
          currency: 'USD',
          description: 'Short-term transit visa'
        }
      ];
      
      await FeeStructure.insertMany(feeStructures);
      console.log('Created sample fee structures');
    } else {
      console.log('Fee structures already exist, skipping creation');
    }
    
    // Check if invoices already exist
    const existingInvoices = await Invoice.countDocuments();
    if (existingInvoices === 0) {
      // Create sample invoices
      const invoices = [
        {
          invoiceNumber: 'INV-2024-0001',
          clientId: 'CL001',
          clientName: 'John Smith',
          issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          totalAmount: 210,
          currency: 'USD',
          status: 'paid',
          items: [
            {
              description: 'Tourist Visa Processing',
              quantity: 1,
              unitPrice: 160,
              total: 160
            },
            {
              description: 'Service Fee',
              quantity: 1,
              unitPrice: 50,
              total: 50
            }
          ],
          notes: 'Standard tourist visa processing for US citizen'
        },
        {
          invoiceNumber: 'INV-2024-0002',
          clientId: 'CL002',
          clientName: 'Sarah Johnson',
          issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          totalAmount: 265,
          currency: 'USD',
          status: 'sent',
          items: [
            {
              description: 'Business Visa Processing',
              quantity: 1,
              unitPrice: 190,
              total: 190
            },
            {
              description: 'Expedited Service',
              quantity: 1,
              unitPrice: 75,
              total: 75
            }
          ],
          notes: 'Business visa with expedited processing'
        },
        {
          invoiceNumber: 'INV-2024-0003',
          clientId: 'CL003',
          clientName: 'Michael Brown',
          issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
          totalAmount: 240,
          currency: 'USD',
          status: 'draft',
          items: [
            {
              description: 'Student Visa Processing',
              quantity: 1,
              unitPrice: 180,
              total: 180
            },
            {
              description: 'Documentation Support',
              quantity: 1,
              unitPrice: 60,
              total: 60
            }
          ],
          notes: 'Student visa with documentation support'
        }
      ];
      
      await Invoice.insertMany(invoices);
      console.log('Created sample invoices');
    } else {
      console.log('Invoices already exist, skipping creation');
    }
    
    // Check if payments already exist
    const existingPayments = await Payment.countDocuments();
    if (existingPayments === 0) {
      // Create sample payments
      const payments = [
        {
          invoiceId: 'sample_invoice_1',
          invoiceNumber: 'INV-2024-0001',
          clientName: 'John Smith',
          amount: 210,
          currency: 'USD',
          status: 'completed',
          method: 'credit-card',
          transactionId: 'txn_123456789',
          gateway: 'Stripe',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          invoiceId: 'sample_invoice_2',
          invoiceNumber: 'INV-2024-0002',
          clientName: 'Sarah Johnson',
          amount: 265,
          currency: 'USD',
          status: 'pending',
          method: 'bank-transfer',
          transactionId: 'bt_987654321',
          gateway: 'Bank Transfer',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          invoiceId: 'sample_invoice_3',
          invoiceNumber: 'INV-2024-0003',
          clientName: 'Michael Brown',
          amount: 240,
          currency: 'USD',
          status: 'pending',
          method: 'paypal',
          transactionId: 'pp_456789123',
          gateway: 'PayPal',
          date: new Date(Date.now())
        }
      ];
      
      await Payment.insertMany(payments);
      console.log('Created sample payments');
    } else {
      console.log('Payments already exist, skipping creation');
    }
    
    console.log('Payment & Billing initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing Payment & Billing data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the initialization
if (require.main === module) {
  initializePaymentBilling();
}

export default initializePaymentBilling;