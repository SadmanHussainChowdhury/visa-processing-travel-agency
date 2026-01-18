import mongoose from 'mongoose';

const visaApplicationSchema = new mongoose.Schema({
  applicantName: {
    type: String,
    required: true
  },
  visaType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processing', 'approved', 'rejected'],
    default: 'draft'
  },
  agent: {
    type: String,
    default: 'Unassigned'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.VisaApplication || mongoose.model('VisaApplication', visaApplicationSchema);