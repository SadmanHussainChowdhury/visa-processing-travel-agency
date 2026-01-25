'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Target, Flag, Clock, CheckCircle, XCircle, TrendingUp, Filter, Search, Download, Eye, Edit, Star } from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

interface CaseIntelligence {
  id: string;
  caseId: string;
  clientName: string;
  visaType: string;
  country: string;
  successProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  duplicateDetected: boolean;
  priority: 'normal' | 'urgent' | 'express';
  riskFlags: string[];
  recommendations: {
    improvements: string[];
    strengths: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  riskLevel: string;
  priority: string;
  visaType: string;
  country: string;
  searchQuery: string;
}

export default function SmartCaseIntelligencePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState<CaseIntelligence[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseIntelligence | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    riskLevel: '',
    priority: '',
    visaType: '',
    country: '',
    searchQuery: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaseData();
  }, []);

  const loadCaseData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/smart-case-intelligence/cases');
      if (response.ok) {
        const data = await response.json();
        setCases(data);
      } else {
        console.error('Failed to fetch case intelligence data:', response.statusText);
        alert('Failed to load case intelligence data. Please try again later.');
      }
    } catch (error) {
      console.error('Error loading case intelligence data:', error);
      alert('Error loading case intelligence data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSelect = async (selectedCase: CaseIntelligence) => {
    try {
      // Fetch the full case details from the API
      const response = await fetch(`/api/smart-case-intelligence/cases/${selectedCase.id}`);
      if (response.ok) {
        const fullCase = await response.json();
        setSelectedCase(fullCase);
        setActiveTab('details');
      } else {
        console.error('Failed to fetch case details:', response.statusText);
        // Fallback to the selected case
        setSelectedCase(selectedCase);
        setActiveTab('details');
      }
    } catch (error) {
      console.error('Error fetching case details:', error);
      // Fallback to the selected case
      setSelectedCase(selectedCase);
      setActiveTab('details');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'normal': return 'bg-gray-100 text-gray-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'express': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(cases.reduce((sum, c) => sum + c.successProbability, 0) / cases.length)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <Flag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duplicates Detected</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.duplicateDetected).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Express Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.priority === 'express').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Case Intelligence Overview</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visa Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Prob
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duplicate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {caseItem.caseId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.visaType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{caseItem.successProbability}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(caseItem.riskLevel)}`}>
                        {caseItem.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.duplicateDetected ? (
                        <span className="text-red-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-green-600 font-medium">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(caseItem.priority)}`}>
                        {caseItem.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCaseSelect(caseItem)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedCase) {
      return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Case Selected</h3>
          <p className="text-gray-500">Select a case from the overview to view its intelligence details</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedCase.clientName}</h3>
              <p className="text-gray-600">{selectedCase.caseId} • {selectedCase.visaType} Visa to {selectedCase.country}</p>
            </div>
            <div className="flex space-x-2">
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedCase.priority)}`}>
                {selectedCase.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Success Probability</h4>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        selectedCase.successProbability >= 80 ? 'bg-green-600' :
                        selectedCase.successProbability >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                      }`} 
                      style={{ width: `${selectedCase.successProbability}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">{selectedCase.successProbability}%</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Risk Level</h4>
              <p className={`text-sm font-medium ${selectedCase.riskLevel === 'low' ? 'text-green-600' : selectedCase.riskLevel === 'medium' ? 'text-yellow-600' : selectedCase.riskLevel === 'high' ? 'text-orange-600' : 'text-red-600'}`}>
                {selectedCase.riskLevel.toUpperCase()}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Duplicate Status</h4>
              <p className={`text-sm font-medium ${selectedCase.duplicateDetected ? 'text-red-600' : 'text-green-600'}`}>
                {selectedCase.duplicateDetected ? 'DUPLICATE FOUND' : 'ORIGINAL'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Flags</h3>
          
          {selectedCase.riskFlags.length > 0 ? (
            <div className="space-y-3">
              {selectedCase.riskFlags.map((flag, index) => (
                <div key={index} className="flex items-start p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-800">{flag}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-green-800">No risk flags detected for this application</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">Improvement Suggestions</h4>
              {selectedCase.recommendations.improvements.length > 0 ? (
                <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
                  {selectedCase.recommendations.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-blue-800">No specific improvements needed. Application is strong.</p>
              )}
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
              {selectedCase.recommendations.strengths.length > 0 ? (
                <ul className="text-sm text-green-800 list-disc pl-5 space-y-1">
                  {selectedCase.recommendations.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-800">No specific strengths identified.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Smart Case Intelligence" 
        description="AI-powered visa application analysis with success probability, risk assessment, and priority management"
      >
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('overview');
                setSelectedCase(null);
              }}
            >
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Intelligence Overview
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => selectedCase && setActiveTab('details')}
              disabled={!selectedCase}
            >
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Case Details
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'details' && renderDetails()}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}