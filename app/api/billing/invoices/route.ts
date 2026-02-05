import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import VisaCase from '@/models/VisaCase';
// Authentication not required for billing API routes

// Helper function to generate unique invoice number
async function generateInvoiceNumber(): Promise<string> {
  await dbConnect();
  
  // Get the latest invoice to determine the next sequence number
  const latestInvoice = await Invoice.findOne({}, {}, { sort: { 'createdAt': -1 } });
  
  let nextSequence = 1;
  if (latestInvoice) {
    const lastNumber = latestInvoice.invoiceNumber;
    const sequenceMatch = lastNumber.match(/INV-(\d+)/);
    if (sequenceMatch) {
      nextSequence = parseInt(sequenceMatch[1]) + 1;
    }
  }
  
  // Format as INV-0001, INV-0002, etc.
  return `INV-${nextSequence.toString().padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const visaCaseId = searchParams.get('visaCaseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (visaCaseId) query.visaCaseId = visaCaseId;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const invoices = await Invoice.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(query);

    return NextResponse.json({
      invoices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate required fields
    if (!body.visaCaseId || !body.clientId || !body.clientName || !body.clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: visaCaseId, clientId, clientName, clientEmail' },
        { status: 400 }
      );
    }

    // Verify visa case exists
    const visaCase = await VisaCase.findById(body.visaCaseId);
    if (!visaCase) {
      return NextResponse.json(
        { error: 'Visa case not found' },
        { status: 404 }
      );
    }

    // Generate unique invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals
    let subtotal = 0;
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((item: any) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        item.amount = quantity * unitPrice;
        subtotal += item.amount;
      });
    }

    const taxRate = Number(body.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    const depositAmount = Math.max(0, Number(body.depositAmount) || 0);
    const dueAmount = Math.max(0, totalAmount - depositAmount);

    // Create invoice
    const invoiceData = {
      invoiceNumber,
      visaCaseId: body.visaCaseId,
      clientId: body.clientId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      items: body.items || [],
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      depositAmount,
      dueAmount,
      currency: body.currency || 'USD',
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status || 'draft',
      notes: body.notes,
      issuedDate: body.status === 'issued' ? new Date() : undefined,
      createdBy: 'system'
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
