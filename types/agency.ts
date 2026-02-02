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