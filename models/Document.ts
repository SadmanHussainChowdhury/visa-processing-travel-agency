import mongoose from 'mongoose';

export interface IDocument {
  _id: string;
  documentId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  url: string;
  clientId?: string;
  clientName?: string;
  visaCaseId?: string;
  tags: string[];
  category: 'passport' | 'visa' | 'insurance' | 'photo' | 'application' | 'financial' | 'health-clearance' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  uploadedBy: string;
  uploadedAt: Date;
  expiryDate?: Date;
  version: number;
  previousVersions: {
    version: number;
    fileName: string;
    filePath: string;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
  notes?: string;
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new mongoose.Schema<IDocument>({
  documentId: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  clientId: {
    type: String,
    trim: true
  },
  clientName: {
    type: String,
    trim: true
  },
  visaCaseId: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['passport', 'visa', 'insurance', 'photo', 'application', 'financial', 'health-clearance', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  uploadedBy: {
    type: String,
    required: true,
    trim: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    fileName: String,
    filePath: String,
    uploadedAt: Date,
    uploadedBy: String
  }],
  notes: {
    type: String,
    trim: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ clientId: 1 });
documentSchema.index({ visaCaseId: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ expiryDate: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ createdAt: -1 });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema);