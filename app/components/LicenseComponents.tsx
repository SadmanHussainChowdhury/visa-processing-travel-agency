'use client';

import { useState, useEffect } from 'react';
import { licenseManager, LicenseInfo } from '@/lib/license-manager';

// Hook for using license in React components
export function useLicense() {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLicense = () => {
      setLicenseInfo(licenseManager.getLicenseInfo());
      setLoading(false);
    };

    loadLicense();
  }, []);

  return {
    licenseInfo,
    isLicensed: licenseManager.isLicensed(),
    isExpiringSoon: licenseManager.isLicenseExpiringSoon(),
    expirationMessage: licenseManager.getLicenseExpirationMessage(),
    loading,
    validateLicense: licenseManager.validateLicense.bind(licenseManager),
    removeLicense: licenseManager.removeLicense.bind(licenseManager)
  };
}

// License validation component
interface LicenseValidationProps {
  onSuccess: () => void;
  showDemoOption?: boolean;
}

export function LicenseValidation({ onSuccess, showDemoOption = true }: LicenseValidationProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');

    try {
      const domain = window.location.hostname;
      const result = await licenseManager.validateLicense(licenseKey, domain);
      
      if (result.valid) {
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during validation');
    } finally {
      setIsChecking(false);
    }
  };

  const handleDemo = () => {
    licenseManager.generateDemoLicense();
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">License Required</h2>
          <p className="text-purple-100">Please validate your license to continue</p>
        </div>
        
        <form onSubmit={handleValidate} className="p-6">
          <div className="mb-6">
            <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 mb-2">
              License Key
            </label>
            <input
              type="text"
              id="licenseKey"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Enter your CodeCanyon license key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isChecking || !licenseKey}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isChecking ? 'Validating...' : 'Validate License'}
          </button>

          {showDemoOption && (
            <button
              type="button"
              onClick={handleDemo}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Use Demo License (30 days)
            </button>
          )}
        </form>
      </div>
    </div>
  );
}