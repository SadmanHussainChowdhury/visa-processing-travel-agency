import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICommission extends Document {
  agentId: string;
  agentName: string;
  period: string; // e.g., "January 2024"
  transactionsCount: number;
  totalAmount: number;
  commissionRate: number; // percentage
  commissionEarned: number;
  status: 'pending' | 'paid';
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commissionSchema = new Schema<ICommission>({
  agentId: {
    type: String,
    required: true,
    trim: true,
  },
  agentName: {
    type: String,
    required: true,
    trim: true,
  },
  period: {
    type: String,
    required: true,
    trim: true,
  },
  transactionsCount: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // percentage
  },
  commissionEarned: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  paymentDate: {
    type: Date,
    required: false,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Commission || 
  mongoose.model<ICommission>('Commission', commissionSchema);