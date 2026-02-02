'use client';

import { useState, useEffect } from 'react';
import { agencyFramework, AgencyType, AgencyConfig } from '@/lib/agency-framework';

interface AgencySetupProps {
  onComplete: (config: AgencyConfig) => void;
}

export default function AgencySetup({ onComplete }: AgencySetupProps) {
  const [agencyType, setAgencyType] = useState<AgencyType>('visa');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const agencyTypes = [
    { id: 'visa', name: 'Visa Processing Agency', icon: '🛂' },
    { id: 'immigration', name: 'Immigration Services', icon: '🏠' },
    { id: 'travel', name: 'Travel Agency', icon: '✈️' },
    { id: 'legal', name: 'Legal Services', icon: '⚖️' },
    { id: 'real_estate', name: 'Real Estate Agency', icon: '🏢' },
    { id: 'consulting', name: 'Business Consulting', icon: '💼' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const config = agencyFramework.initialize(agencyType, {
        name: customName || agencyTypes.find(t => t.id === agencyType)?.name || 'Agency'
      });
      
      // Save to localStorage for persistence
      localStorage.setItem('agencyConfig', JSON.stringify(config));
      
      onComplete(config);
    } catch (error) {
      console.error('Failed to initialize agency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingConfig = () => {
    const savedConfig = localStorage.getItem('agencyConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        agencyFramework.initialize(config.type, config);
        onComplete(config);
        return true;
      } catch (error) {
        console.error('Failed to load saved configuration:', error);
      }
    }
    return false;
  };

  useEffect(() => {
    // Check for existing configuration on mount
    loadExistingConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Agency Setup</h1>
          <p className="text-blue-100">Configure your agency management system</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Agency Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agencyTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setAgencyType(type.id as AgencyType)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    agencyType === type.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {agencyFramework.getBaseConfig(type.id as AgencyType).features.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Agency Name (Optional)
            </label>
            <input
              type="text"
              id="agencyName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={agencyTypes.find(t => t.id === agencyType)?.name}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Selected Configuration</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><span className="font-medium">Type:</span> {agencyTypes.find(t => t.id === agencyType)?.name}</p>
              <p><span className="font-medium">Modules:</span> {agencyFramework.getBaseConfig(agencyType).modules.join(', ')}</p>
              <p><span className="font-medium">Features:</span> {agencyFramework.getBaseConfig(agencyType).features.join(', ')}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <span>Get Started</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}