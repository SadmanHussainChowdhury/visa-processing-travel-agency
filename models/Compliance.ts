import mongoose from 'mongoose';

const complianceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['GDPR', 'LOCAL', 'SECURITY', 'BACKUP']
  },
  status: {
    type: String,
    required: true,
    enum: ['compliant', 'non-compliant', 'pending', 'partial', 'up-to-date', 'outdated', 'failed']
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  nextCheck: {
    type: Date
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  checkedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Compliance || mongoose.model('Compliance', complianceSchema);
