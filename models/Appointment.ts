import mongoose from 'mongoose';

export interface IAppointment {
  _id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  consultantName: string;
  consultantEmail?: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: 'visa-consultation' | 'document-review' | 'interview-preparation' | 'application-submission' | 'status-update' | 'follow-up' | 'compliance-check' | 'case-review';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'inProgress' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  requirements?: string[];
  consultationNotes?: string;
  recommendations?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new mongoose.Schema<IAppointment>(
  {
    clientId: {
      type: String,
      required: false,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    clientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    consultantName: {
      type: String,
      required: true,
      trim: true,
    },
    consultantEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ['visa-consultation', 'document-review', 'interview-preparation', 'application-submission', 'status-update', 'follow-up', 'compliance-check', 'case-review'],
      default: 'visa-consultation',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'inProgress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    requirements: [{
      type: String,
      trim: true,
    }],
    consultationNotes: {
      type: String,
      trim: true,
    },
    recommendations: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple model initialization in development
export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);
