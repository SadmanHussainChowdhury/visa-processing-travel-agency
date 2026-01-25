'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, DollarSign, Users, FileText, Download, Filter } from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

interface ReportData {
  daily: any[];
  weekly: any[];
  monthly: any[];
  visaTypes: any[];
}

interface FilterOptions {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  visaType: string;
  agent: string;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState<ReportData>({
    daily: [],
    weekly: [],
    monthly: [],
    visaTypes: []
  });
  const [filters, setFilters] = useState<FilterOptions>({
    period: 'monthly',
    startDate: '',
    endDate: '',
    visaType: '',
    agent: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Load all report data concurrently
      const [
        dailyResponse,
        weeklyResponse,
        monthlyResponse,
        visaTypesResponse
      ] = await Promise.all([
        fetch('/api/reports/daily'),
        fetch('/api/reports/weekly'),
        fetch('/api/reports/monthly'),
        fetch('/api/reports/visa-types')
      ]);

      const daily = dailyResponse.ok ? await dailyResponse.json() : [];
      const weekly = weeklyResponse.ok ? await weeklyResponse.json() : [];
      const monthly = monthlyResponse.ok ? await monthlyResponse.json() : [];
      const visaTypes = visaTypesResponse.ok ? await visaTypesResponse.json() : [];

      setReportData({
        daily,
        weekly,
        monthly,
        visaTypes
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportType: string) => {
    try {
      const response = await fetch(`/api/reports/${reportType}?format=csv&startDate=${filters.startDate}&endDate=${filters.endDate}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const refreshReportData = async () => {
    await loadReportData();
  };



  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900">
              {reportData.monthly.reduce((sum, item) => sum + (item.count || 0), 0)}
            </p>
          </div>
          <button 
            onClick={refreshReportData}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh Data"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {reportData.visaTypes.length > 0 
                ? Math.round(reportData.visaTypes.reduce((sum, item) => sum + (item.successRate || 0), 0) / reportData.visaTypes.length) + '%'
                : '0%'
              }
            </p>
          </div>
          <button 
            onClick={refreshReportData}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh Data"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${reportData.monthly.reduce((sum, item) => sum + (item.revenue || 0), 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
          <button 
            onClick={refreshReportData}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh Data"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <Users className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">Active Agents</p>
            <p className="text-2xl font-bold text-gray-900">
              {Array.from(new Set(reportData.monthly.flatMap(item => item.applications?.map((app: any) => app.agent) || []))).length}
            </p>
          </div>
          <button 
            onClick={refreshReportData}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh Data"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTimePeriodReports = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Time Period Reports</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => exportReport(filters.period)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Daily Report</h4>
              <ul className="space-y-2 text-sm">
                {reportData.daily.slice(0, 5).map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.date || `Day ${index + 1}`}</span>
                    <span className="font-medium">{item.count || 0} applications</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Weekly Report</h4>
              <ul className="space-y-2 text-sm">
                {reportData.weekly.slice(0, 4).map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.week || `Week ${index + 1}`}</span>
                    <span className="font-medium">{item.count || 0} applications</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Monthly Report</h4>
              <ul className="space-y-2 text-sm">
                {reportData.monthly.slice(0, 6).map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.month || `Month ${index + 1}`}</span>
                    <span className="font-medium">{item.count || 0} applications</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVisaTypesReport = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Visa Types & Success Rates</h3>
          <button 
            onClick={() => exportReport('visa-types')}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.visaTypes.map((visa, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {visa.type || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visa.total || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visa.approved || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visa.rejected || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (visa.successRate || 0) >= 80 ? 'bg-green-600' : 
                            (visa.successRate || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${visa.successRate || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{visa.successRate || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );




  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Reporting & Analytics" 
        description="Comprehensive reporting and analytics for visa processing operations"
      >
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={filters.period}
                onChange={(e) => setFilters({...filters, period: e.target.value as any})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start Date"
              />
              
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="End Date"
              />
              
              <button
                onClick={loadReportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'time-period'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('time-period')}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Time Period Reports
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'visa-types'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('visa-types')}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Visa Types & Success Rates
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'time-period' && renderTimePeriodReports()}
          {activeTab === 'visa-types' && renderVisaTypesReport()}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}