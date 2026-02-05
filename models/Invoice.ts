import mongoose from 'mongoose';

export interface IInvoice {
  _id: string;
  invoiceNumber: string; // Unique invoice number with prefix & sequence control (e.g., INV-0001)
  visaCaseId: string; // Reference to the visa case
  clientId: string; // Reference to the client
  clientName: string;
  clientEmail: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount?: number;
  dueAmount?: number;
  currency: string;
  dueDate?: Date;
  issuedDate?: Date;
  paidDate?: Date;
  cancelledDate?: Date;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  itemType: 'service' | 'fee' | 'consultation' | 'processing' | 'other';
}

const invoiceItemSchema = new mongoose.Schema<IInvoiceItem>({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  itemType: { 
    type: String, 
    enum: ['service', 'fee', 'consultation', 'processing', 'other'],
    default: 'service'
  }
});

const invoiceSchema = new mongoose.Schema<IInvoice>({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  visaCaseId: {
    type: String,
    required: true,
    trim: true
  },
  clientId: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  depositAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    trim: true
  },
  dueDate: {
    type: Date
  },
  issuedDate: {
    type: Date
  },
  paidDate: {
    type: Date
  },
  cancelledDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'cancelled'],
    default: 'draft'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ visaCaseId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });


export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema);
