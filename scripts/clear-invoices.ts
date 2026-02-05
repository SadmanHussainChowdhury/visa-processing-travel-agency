import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Invoice from '../models/Invoice';

async function clearMockInvoices() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');
    
    // Count existing invoices
    const invoiceCount = await Invoice.countDocuments();
    console.log(`Found ${invoiceCount} invoices in database`);
    
    if (invoiceCount > 0) {
      // Show what invoices exist
      const invoices = await Invoice.find({}, { invoiceNumber: 1, clientName: 1, status: 1, createdAt: 1 });
      console.log('Existing invoices:');
      invoices.forEach(invoice => {
        console.log(`- ${invoice.invoiceNumber}: ${invoice.clientName} (${invoice.status}) - ${invoice.createdAt}`);
      });
      
      // Delete all invoices
      const result = await Invoice.deleteMany({});
      console.log(`Deleted ${result.deletedCount} invoices`);
    } else {
      console.log('No invoices found in database');
    }
    
    console.log('Invoice cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning invoices:', error);
    process.exit(1);
  }
}

clearMockInvoices();