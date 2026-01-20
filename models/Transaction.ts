import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  invoiceId: {
    type: String,
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'adjustment', 'fee'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled', 'failed'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['credit-card', 'bank-transfer', 'paypal', 'cash', 'cheque'],
    required: true
  },
  gateway: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  processedBy: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

export default mongoose.models.VisaTransaction || mongoose.model('VisaTransaction', transactionSchema);