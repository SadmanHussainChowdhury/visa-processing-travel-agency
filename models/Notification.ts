import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipient {
  id: string;
  name: string;
  contact: string;
}

export interface INotification extends Document {
  type: 'email' | 'sms' | 'both' | 'alert';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'active';
  subject: string;
  content: string;
  recipients: IRecipient[];
  priority: 'low' | 'medium' | 'high';
  sendTime: 'immediate' | 'scheduled';
  clientId?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recipientSchema = new mongoose.Schema<IRecipient>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
});

const notificationSchema = new mongoose.Schema<INotification>({
  type: {
    type: String,
    enum: ['email', 'sms', 'both', 'alert'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'active'],
    default: 'pending',
  },
  subject: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  recipients: [recipientSchema],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  sendTime: {
    type: String,
    enum: ['immediate', 'scheduled'],
    default: 'immediate',
  },
  clientId: {
    type: String,
    ref: 'Client',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Notification || 
  mongoose.model<INotification>('Notification', notificationSchema);