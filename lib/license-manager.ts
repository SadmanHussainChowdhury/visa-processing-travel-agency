import { AgencyConfig } from '@/types/agency';

export interface LicenseInfo {
  licenseKey: string;
  purchaseCode: string;
  buyer: string;
  purchaseDate: Date;
  supportedUntil: Date;
  itemType: string;
  licenseType: 'Regular' | 'Extended';
  domain: string;
  isValid: boolean;
  validationMessage?: string;
}

export interface LicenseValidationResponse {
  valid: boolean;
  license?: LicenseInfo;
  error?: string;
  message: string;
}

export class LicenseManager {
  private static instance: LicenseManager;
  private licenseInfo: LicenseInfo | null = null;
  private validationEndpoint = '/api/license/validate';

  private constructor() {}

  static getInstance(): LicenseManager {
    if (!LicenseManager.instance) {
      LicenseManager.instance = new LicenseManager();
    }
    return LicenseManager.instance;
  }

  // Validate license with CodeCanyon API
  async validateLicense(licenseKey: string, domain: string): Promise<LicenseValidationResponse> {
    try {
      const response = await fetch(this.validationEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey,
          domain,
          itemId: process.env.NEXT_PUBLIC_ITEM_ID || 'your-item-id-here'
        })
      });

      const result = await response.json();
      
      if (result.valid) {
        this.licenseInfo = result.license;
        this.storeLicenseLocally(result.license);
        return { 
          valid: true, 
          license: result.license,
          message: 'License validated successfully' 
        };
      } else {
        return { 
          valid: false, 
          error: result.error,
          message: result.message || 'Invalid license' 
        };
      }
    } catch (error) {
      console.error('License validation error:', error);
      return { 
        valid: false, 
        error: 'NETWORK_ERROR',
        message: 'Unable to validate license. Please check your connection.' 
      };
    }
  }

  // Check if system is properly licensed
  isLicensed(): boolean {
    if (!this.licenseInfo) {
      this.loadLicenseFromStorage();
    }
    
    if (!this.licenseInfo) return false;
    
    // Check if license is still valid
    const now = new Date();
    return this.licenseInfo.isValid && 
           new Date(this.licenseInfo.supportedUntil) > now;
  }

  // Get current license information
  getLicenseInfo(): LicenseInfo | null {
    if (!this.licenseInfo) {
      this.loadLicenseFromStorage();
    }
    return this.licenseInfo;
  }

  // Check if license is about to expire
  isLicenseExpiringSoon(): boolean {
    const license = this.getLicenseInfo();
    if (!license) return false;
    
    const expirationDate = new Date(license.supportedUntil);
    const warningPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const now = new Date();
    
    return (expirationDate.getTime() - now.getTime()) < warningPeriod;
  }

  // Get license expiration message
  getLicenseExpirationMessage(): string | null {
    const license = this.getLicenseInfo();
    if (!license) return 'No valid license found';
    
    const expirationDate = new Date(license.supportedUntil);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysUntilExpiration <= 0) {
      return `License expired on ${expirationDate.toLocaleDateString()}. Please renew your license.`;
    } else if (daysUntilExpiration <= 7) {
      return `License expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}. Please renew soon.`;
    } else if (daysUntilExpiration <= 30) {
      return `License expires on ${expirationDate.toLocaleDateString()} (${daysUntilExpiration} days remaining).`;
    }
    
    return null;
  }

  // Remove license (for logout/reset)
  removeLicense(): void {
    this.licenseInfo = null;
    localStorage.removeItem('agencyLicense');
  }

  // Store license locally for offline validation
  private storeLicenseLocally(license: LicenseInfo): void {
    try {
      localStorage.setItem('agencyLicense', JSON.stringify({
        ...license,
        purchaseDate: license.purchaseDate.toISOString(),
        supportedUntil: license.supportedUntil.toISOString()
      }));
    } catch (error) {
      console.error('Failed to store license locally:', error);
    }
  }

  // Load license from local storage
  private loadLicenseFromStorage(): void {
    try {
      const storedLicense = localStorage.getItem('agencyLicense');
      if (storedLicense) {
        const parsed = JSON.parse(storedLicense);
        this.licenseInfo = {
          ...parsed,
          purchaseDate: new Date(parsed.purchaseDate),
          supportedUntil: new Date(parsed.supportedUntil)
        };
      }
    } catch (error) {
      console.error('Failed to load license from storage:', error);
      this.licenseInfo = null;
    }
  }

  // Generate demo license for development/testing
  generateDemoLicense(): LicenseInfo {
    const demoLicense: LicenseInfo = {
      licenseKey: 'DEMO_LICENSE_KEY_12345',
      purchaseCode: 'DEMO_PURCHASE_CODE_67890',
      buyer: 'Demo User',
      purchaseDate: new Date(),
      supportedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      itemType: 'Agency Management System',
      licenseType: 'Regular',
      domain: window.location.hostname,
      isValid: true
    };

    this.licenseInfo = demoLicense;
    this.storeLicenseLocally(demoLicense);
    return demoLicense;
  }
}

// Export singleton instance
export const licenseManager = LicenseManager.getInstance();

// Note: React components have been moved to separate files for proper TypeScript compilation