import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'social_media', 'referral', 'advertisement', 'other']
  },
  status: {
    type: String,
    default: 'new',
    enum: ['new', 'contacted', 'qualified', 'lost', 'converted']
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high']
  },
  assignedTo: {
    type: String,
    default: 'unassigned'
  },
  lastContact: {
    type: String, // Changed to String to avoid potential type issues
    default: null
  },
  nextFollowUp: {
    type: String, // Changed to String to avoid potential type issues
    default: null
  },
  leadScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  countryInterest: {
    type: String,
    default: '',
    trim: true
  },
  visaType: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: 1 });

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);