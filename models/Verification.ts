import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    ref: 'Client'
  },
  verificationType: {
    type: String,
    enum: ['identity', 'biometric', 'document', 'anti-fraud'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'flagged'],
    default: 'pending'
  },
  method: {
    type: String,
    required: true
  },
  result: {
    type: Object,
    default: {}
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  notes: {
    type: String,
    default: ''
  },
  verifiedBy: {
    type: String,
    ref: 'User'
  },
  expiryDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Verification || mongoose.model('Verification', verificationSchema);