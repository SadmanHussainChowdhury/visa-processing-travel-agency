import mongoose, { Schema, Document } from 'mongoose';

export interface IFormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface IFormTemplate extends Document {
  _id: string;
  templateId: string;
  name: string;
  country: string;
  category: string;
  description?: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  fields: IFormField[];
  createdAt: Date;
  updatedAt: Date;
}

const formFieldSchema = new mongoose.Schema<IFormField>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'email', 'phone', 'date', 'select', 'checkbox', 'radio', 'textarea'],
    required: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  placeholder: {
    type: String,
    trim: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: [{
    type: String,
    trim: true,
  }],
  defaultValue: {
    type: String,
    trim: true,
  },
});

const formTemplateSchema = new mongoose.Schema<IFormTemplate>({
  templateId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  version: {
    type: String,
    required: true,
    default: '2024',
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  },
  fields: [formFieldSchema],
}, {
  timestamps: true,
});

export default mongoose.models.FormTemplate || 
  mongoose.model<IFormTemplate>('FormTemplate', formTemplateSchema);