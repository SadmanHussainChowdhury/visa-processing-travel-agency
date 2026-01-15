import mongoose from 'mongoose';

export interface IVisaCase {
  _id: string;
  caseId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  visaType: string;
  country: string;
  status: 'draft' | 'submitted' | 'in-process' | 'approved' | 'rejected';

  applicationDate: Date;
  submissionDate?: Date;
  decisionDate?: Date;
  expectedDecisionDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  documents: IVisaDocument[];
  checklistItems: IChecklistItem[];
  notes: string[];
  reminders: IReminder[];
  alerts: IAlert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IVisaDocument {
  name: string;
  type: string;
  uploaded: boolean;
  uploadDate?: Date;
  fileUrl?: string;
  required: boolean;
  notes?: string;
}

export interface IChecklistItem {
  category: string;
  item: string;
  completed: boolean;
  completedDate?: Date;
  notes?: string;
}

export interface IReminder {
  type: 'document-deadline' | 'interview-prep' | 'follow-up' | 'general';
  message: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface IAlert {
  type: 'deadline-warning' | 'missing-document' | 'status-change' | 'urgent-action';
  message: string;
  severity: 'info' | 'warning' | 'error';
  triggeredDate: Date;
  resolved: boolean;
  resolvedDate?: Date;
}

const visaDocumentSchema = new mongoose.Schema<IVisaDocument>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  uploaded: { type: Boolean, default: false },
  uploadDate: { type: Date },
  fileUrl: { type: String },
  required: { type: Boolean, default: true },
  notes: { type: String }
});

const checklistItemSchema = new mongoose.Schema<IChecklistItem>({
  category: { type: String, required: true },
  item: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date },
  notes: { type: String }
});

const reminderSchema = new mongoose.Schema<IReminder>({
  type: { 
    type: String, 
    enum: ['document-deadline', 'interview-prep', 'follow-up', 'general'],
    required: true 
  },
  message: { type: String, required: true },
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date }
});

const alertSchema = new mongoose.Schema<IAlert>({
  type: { 
    type: String, 
    enum: ['deadline-warning', 'missing-document', 'status-change', 'urgent-action'],
    required: true 
  },
  message: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'error'],
    default: 'info' 
  },
  triggeredDate: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolvedDate: { type: Date }
});

const visaCaseSchema = new mongoose.Schema<IVisaCase>({
  caseId: {
    type: String,
    unique: true,
    trim: true
  },
  clientId: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  visaType: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'in-process', 'approved', 'rejected'],
    default: 'draft'
  },

  applicationDate: {
    type: Date,
    default: Date.now
  },
  submissionDate: {
    type: Date
  },
  decisionDate: {
    type: Date
  },
  expectedDecisionDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  documents: [visaDocumentSchema],
  checklistItems: [checklistItemSchema],
  notes: [{
    type: String,
    trim: true
  }],
  reminders: [reminderSchema],
  alerts: [alertSchema]
}, {
  timestamps: true
});



// Index for better query performance
visaCaseSchema.index({ clientId: 1 });
visaCaseSchema.index({ status: 1 });

visaCaseSchema.index({ createdAt: -1 });

export default mongoose.models.VisaCase || mongoose.model<IVisaCase>('VisaCase', visaCaseSchema);