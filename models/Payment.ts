import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['credit-card', 'bank-transfer', 'paypal', 'cash'],
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  gateway: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);