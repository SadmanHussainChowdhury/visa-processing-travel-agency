import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  governmentFee: {
    type: Number,
    required: true
  },
  serviceFee: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

export default mongoose.models.FeeStructure || mongoose.model('FeeStructure', feeStructureSchema);