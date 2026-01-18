import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentAlert extends Document {
  clientId: string;
  documentType: string;
  documentId: string;
  alertType: 'missing' | 'expiring' | 'expired';
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved' | 'dismissed';
  dueDate?: Date;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentAlertSchema = new mongoose.Schema<IDocumentAlert>({
  clientId: {
    type: String,
    required: true,
    ref: 'Client',
  },
  documentType: {
    type: String,
    required: true,
  },
  documentId: {
    type: String,
    required: true,
  },
  alertType: {
    type: String,
    enum: ['missing', 'expiring', 'expired'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'dismissed'],
    default: 'active',
  },
  dueDate: {
    type: Date,
  },
  expirationDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.DocumentAlert || 
  mongoose.model<IDocumentAlert>('DocumentAlert', documentAlertSchema);