import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClientRef {
  id: string;
  name: string;
}

export interface ITransaction extends Document {
  date: Date;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  category: string;
  client?: IClientRef;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const clientRefSchema = new Schema<IClientRef>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const transactionSchema = new Schema<ITransaction>({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['revenue', 'expense'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  client: {
    type: clientRefSchema,
    required: false,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || 
  mongoose.model<ITransaction>('Transaction', transactionSchema);