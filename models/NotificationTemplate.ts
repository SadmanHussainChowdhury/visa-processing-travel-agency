import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationTemplate extends Document {
  name: string;
  type: 'email' | 'sms';
  category: string;
  subject: string;
  content: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

const notificationTemplateSchema = new mongoose.Schema<INotificationTemplate>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['email', 'sms'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    default: '',
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  variables: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.NotificationTemplate || 
  mongoose.model<INotificationTemplate>('NotificationTemplate', notificationTemplateSchema);