import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  commission: {
    type: Number,
    required: true,
    default: 0
  },
  agent: {
    type: String,
    default: 'Unassigned'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);