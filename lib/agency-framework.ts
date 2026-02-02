import { AgencyType, AgencyConfig } from '@/types/agency';

// Generic Agency Framework
export class AgencyFramework {
  private static instance: AgencyFramework;
  private config: AgencyConfig | null = null;

  private constructor() {}

  static getInstance(): AgencyFramework {
    if (!AgencyFramework.instance) {
      AgencyFramework.instance = new AgencyFramework();
    }
    return AgencyFramework.instance;
  }

  // Initialize agency with specific type
  initialize(agencyType: AgencyType, customConfig?: Partial<AgencyConfig>) {
    const baseConfig = this.getBaseConfig(agencyType);
    this.config = {
      ...baseConfig,
      ...customConfig,
      type: agencyType,
      initialized: true,
      createdAt: new Date()
    };
    return this.config;
  }

  // Get agency configuration
  getConfig(): AgencyConfig | null {
    return this.config;
  }

  // Get base configuration for agency type
  public getBaseConfig(agencyType: AgencyType): Omit<AgencyConfig, 'type' | 'initialized' | 'createdAt'> {
    const configs: Record<AgencyType, Omit<AgencyConfig, 'type' | 'initialized' | 'createdAt'>> = {
      visa: {
        name: 'Visa Processing Agency',
        modules: ['clients', 'appointments', 'documents', 'cases', 'billing'],
        features: ['document_verification', 'interview_preparation', 'application_tracking'],
        terminology: {
          client: 'Client',
          case: 'Visa Case',
          appointment: 'Consultation',
          document: 'Visa Document'
        },
        workflows: ['application_review', 'document_check', 'interview_scheduling'],
        requiredFields: ['passport_number', 'visa_type', 'travel_purpose']
      },
      immigration: {
        name: 'Immigration Services',
        modules: ['clients', 'cases', 'appointments', 'documents', 'compliance'],
        features: ['residency_applications', 'citizenship_processing', 'legal_consultation'],
        terminology: {
          client: 'Applicant',
          case: 'Immigration Case',
          appointment: 'Legal Consultation',
          document: 'Legal Document'
        },
        workflows: ['eligibility_check', 'application_filing', 'hearing_preparation'],
        requiredFields: ['country_of_origin', 'residency_status', 'legal_representation']
      },
      travel: {
        name: 'Travel Agency',
        modules: ['clients', 'bookings', 'itineraries', 'payments', 'support'],
        features: ['flight_booking', 'hotel_reservation', 'tour_packages'],
        terminology: {
          client: 'Traveler',
          case: 'Travel Booking',
          appointment: 'Travel Consultation',
          document: 'Travel Document'
        },
        workflows: ['destination_selection', 'booking_confirmation', 'travel_preparation'],
        requiredFields: ['travel_dates', 'destination', 'budget_range']
      },
      legal: {
        name: 'Legal Services',
        modules: ['clients', 'cases', 'documents', 'billing', 'calendar'],
        features: ['case_management', 'document_preparation', 'court_scheduling'],
        terminology: {
          client: 'Client',
          case: 'Legal Case',
          appointment: 'Legal Consultation',
          document: 'Legal Document'
        },
        workflows: ['case_intake', 'document_review', 'court_preparation'],
        requiredFields: ['case_type', 'jurisdiction', 'legal_representative']
      },
      real_estate: {
        name: 'Real Estate Agency',
        modules: ['clients', 'properties', 'listings', 'transactions', 'appointments'],
        features: ['property_listings', 'viewing_scheduling', 'transaction_management'],
        terminology: {
          client: 'Client',
          case: 'Property Transaction',
          appointment: 'Property Viewing',
          document: 'Real Estate Document'
        },
        workflows: ['property_search', 'viewing_arrangement', 'contract_negotiation'],
        requiredFields: ['property_type', 'budget', 'location_preferences']
      },
      consulting: {
        name: 'Business Consulting',
        modules: ['clients', 'projects', 'appointments', 'documents', 'billing'],
        features: ['project_management', 'consultation_scheduling', 'report_generation'],
        terminology: {
          client: 'Client',
          case: 'Consulting Project',
          appointment: 'Business Consultation',
          document: 'Business Document'
        },
        workflows: ['needs_assessment', 'proposal_development', 'implementation_planning'],
        requiredFields: ['business_industry', 'consulting_needs', 'project_scope']
      }
    };

    return configs[agencyType] || configs.visa;
  }

  // Check if module is enabled for current agency
  isModuleEnabled(moduleName: string): boolean {
    if (!this.config) return false;
    return this.config.modules.includes(moduleName);
  }

  // Get terminology for current agency type
  getTerminology(key: keyof AgencyConfig['terminology']): string {
    if (!this.config) return String(key).charAt(0).toUpperCase() + String(key).slice(1);
    return this.config.terminology[key] || String(key).charAt(0).toUpperCase() + String(key).slice(1);
  }

  // Get available workflows
  getWorkflows(): string[] {
    if (!this.config) return [];
    return this.config.workflows;
  }

  // Check if feature is available
  hasFeature(feature: string): boolean {
    if (!this.config) return false;
    return this.config.features.includes(feature);
  }
}

// Export singleton instance
export const agencyFramework = AgencyFramework.getInstance();

// Type definitions
export type AgencyType = 'visa' | 'immigration' | 'travel' | 'legal' | 'real_estate' | 'consulting';

export interface AgencyConfig {
  type: AgencyType;
  name: string;
  modules: string[];
  features: string[];
  terminology: {
    client: string;
    case: string;
    appointment: string;
    document: string;
  };
  workflows: string[];
  requiredFields: string[];
  initialized: boolean;
  createdAt: Date;
}