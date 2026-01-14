import mongoose from 'mongoose';

export interface IClient {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  passportNumber: string;
  passportCountry: string;
  visaType: string;
  visaApplicationDate: Date;
  visaExpirationDate?: Date;
  specialRequirements?: string[];
  currentApplications?: string[];
  travelHistory?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new mongoose.Schema<IClient>(
  {
    clientId: {
      type: String,
      unique: true,
      required: false, // Will be auto-generated in pre-save hook
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    zipCode: {
      type: String,
      required: false,
      trim: true,
    },
    passportNumber: {
      type: String,
      required: true,
      trim: true,
    },
    passportCountry: {
      type: String,
      required: true,
      trim: true,
    },
    visaType: {
      type: String,
      required: true,
      trim: true,
    },
    visaApplicationDate: {
      type: Date,
      required: true,
    },
    visaExpirationDate: {
      type: Date,
      required: false,
    },
    specialRequirements: [{
      type: String,
      trim: true,
    }],
    currentApplications: [{
      type: String,
      trim: true,
    }],
    travelHistory: [{
      type: String,
      trim: true,
    }],
    emergencyContact: {
      name: {
        type: String,
        required: false,
        trim: true,
      },
      phone: {
        type: String,
        required: false,
        trim: true,
      },
      relationship: {
        type: String,
        required: false,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate client ID
clientSchema.pre('save', async function(next) {
  // Always generate clientId if it doesn't exist (for new documents)
  if (!this.clientId) {
    try {
      // Find the highest existing client ID
      const ClientModel = this.constructor as any;
      const lastClient = await ClientModel.findOne({}, { clientId: 1 }, { sort: { clientId: -1 } });
      
      let nextId = 1;
      if (lastClient && lastClient.clientId) {
        // Extract number from existing client ID (e.g., "CLI-0001" -> 1)
        const match = lastClient.clientId.match(/CLI-(\d+)/);
        if (match) {
          nextId = parseInt(match[1]) + 1;
        }
      }
      
      // Generate new client ID with zero-padding
      this.clientId = `CLI-${nextId.toString().padStart(4, '0')}`;
      console.log('Generated clientId:', this.clientId);
    } catch (error) {
      console.error('Error generating client ID:', error);
      // Fallback to timestamp-based ID
      this.clientId = `CLI-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Prevent multiple model initialization in development
export default mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);