import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    ref: 'Client',
    default: null
  },
  clientName: {
    type: String,
    default: 'Unknown Client'
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['revenue', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: String, // Using String to avoid timezone issues
    required: true
  },
  applicationId: {
    type: String,
    ref: 'VisaApplication',
    default: null
  },
  userId: {
    type: String,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
transactionSchema.index({ clientId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ date: 1 });
transactionSchema.index({ applicationId: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);