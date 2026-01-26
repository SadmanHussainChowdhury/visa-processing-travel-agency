import mongoose from 'mongoose';

// Interface for visa knowledge base entries
export interface IVisaKnowledge {
  country: string;
  visaType: string;
  requirements: string[];
  processingTime: string;
  fees: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tips: string;
  lastUpdated: Date;
}

// Interface for SOP documents
export interface ISOPDocument {
  title: string;
  type: string;
  country: string;
  version: string;
  content: string;
  lastUpdated: Date;
  author: string;
}

// Interface for learning guidelines
export interface ILearningGuideline {
  title: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  rating: number;
  enrolled: number;
}

// Interface for rejection prevention tips
export interface IRejectionTip {
  country: string;
  visaType: string;
  tipCategory: string;
  title: string;
  description: string;
  solution: string;
  example: string;
}

// Schema for visa knowledge base entries
const visaKnowledgeSchema = new mongoose.Schema<IVisaKnowledge>({
  country: { type: String, required: true },
  visaType: { type: String, required: true },
  requirements: [{ type: String }],
  processingTime: { type: String, required: true },
  fees: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tips: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

// Schema for SOP documents
const sopDocumentSchema = new mongoose.Schema<ISOPDocument>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  country: { type: String, required: true },
  version: { type: String, required: true },
  content: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
  author: { type: String, required: true }
});

// Schema for learning guidelines
const learningGuidelineSchema = new mongoose.Schema<ILearningGuideline>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  completed: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  enrolled: { type: Number, default: 0 }
});

// Schema for rejection prevention tips
const rejectionTipSchema = new mongoose.Schema<IRejectionTip>({
  country: { type: String, required: true },
  visaType: { type: String, required: true },
  tipCategory: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  solution: { type: String, required: true },
  example: { type: String, required: true }
});

// Create models
export const VisaKnowledge = mongoose.models.VisaKnowledge || mongoose.model<IVisaKnowledge>('VisaKnowledge', visaKnowledgeSchema);
export const SOPDocument = mongoose.models.SOPDocument || mongoose.model<ISOPDocument>('SOPDocument', sopDocumentSchema);
export const LearningGuideline = mongoose.models.LearningGuideline || mongoose.model<ILearningGuideline>('LearningGuideline', learningGuidelineSchema);
export const RejectionTip = mongoose.models.RejectionTip || mongoose.model<IRejectionTip>('RejectionTip', rejectionTipSchema);