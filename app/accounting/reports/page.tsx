'use client';

import { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  DollarSign, 
  Calculator, 
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('profit-margin');
  const [dateRange, setDateRange] = useState('this-month');

  const [reportData, setReportData] = useState({
    profitMargin: {
      current: 0,
      previous: 0,
      trend: 'neutral'
    },
    revenue: {
      current: 0,
      previous: 0,
      trend: 'neutral'
    },
    expenses: {
      current: 0,
      previous: 0,
      trend: 'neutral'
    },
    commission: {
      current: 0,
      previous: 0,
      trend: 'neutral'
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/accounting');
        if (response.ok) {
          const data = await response.json();
          setReportData({
            profitMargin: {
              current: data.profitMargin || 0,
              previous: 0, // Would come from comparing previous period
              trend: data.profitMargin && data.profitMargin > 0 ? 'up' : 'down'
            },
            revenue: {
              current: data.totalRevenue || 0,
              previous: 0, // Would come from comparing previous period
              trend: data.totalRevenue && data.totalRevenue > 0 ? 'up' : 'down'
            },
            expenses: {
              current: data.totalExpenses || 0,
              previous: 0, // Would come from comparing previous period
              trend: data.totalExpenses && data.totalExpenses > 0 ? 'up' : 'down'
            },
            commission: {
              current: data.totalCommissionEarned || 0,
              previous: 0, // Would come from comparing previous period
              trend: data.totalCommissionEarned && data.totalCommissionEarned > 0 ? 'up' : 'down'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);

  const reportTypes = [
    { id: 'profit-margin', name: 'Profit Margin Report', icon: BarChart3, description: 'Analyze profit margins across different periods' },
    { id: 'commission', name: 'Commission Report', icon: Calculator, description: 'Calculate and track agent commissions' },
    { id: 'tax', name: 'Tax Report', icon: DollarSign, description: 'Prepare tax calculations and reports' },
    { id: 'revenue-analysis', name: 'Revenue Analysis', icon: TrendingUp, description: 'Analyze revenue trends and sources' },
    { id: 'expense-breakdown', name: 'Expense Breakdown', icon: TrendingDown, description: 'Detailed expense categorization' },
    { id: 'cash-flow', name: 'Cash Flow Report', icon: Wallet, description: 'Monitor cash inflows and outflows' }
  ];

  const generateReport = (reportType: string) => {
    alert(`Generating ${reportType} report...`);
    // In a real implementation, this would generate the actual report
  };

  const exportReport = (reportType: string) => {
    alert(`Exporting ${reportType} report...`);
    // In a real implementation, this would download the report
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Financial Reports" 
        description="Generate and analyze financial reports"
      >
        {/* Report Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Available Reports</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className={`bg-white rounded-lg shadow border p-6 cursor-pointer transition-all ${
                  activeReport === report.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveReport(report.id)}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <report.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateReport(report.name);
                    }}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Generate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportReport(report.name);
                    }}
                    className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {reportTypes.find(r => r.id === activeReport)?.name} Preview
              </h3>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Schedule
                </button>
                <button
                  onClick={() => exportReport(reportTypes.find(r => r.id === activeReport)?.name || '')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">
            {activeReport === 'profit-margin' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm text-blue-600">Current Profit Margin</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.profitMargin.current}%</p>
                        <p className="text-xs text-gray-600">
                          {reportData.profitMargin.trend === 'up' ? '+' : ''}
                          {reportData.profitMargin.current - reportData.profitMargin.previous}% from last period
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm text-green-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${reportData.revenue.current.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">
                          {reportData.revenue.trend === 'up' ? '+' : ''}
                          {((reportData.revenue.current - reportData.revenue.previous) / reportData.revenue.previous * 100).toFixed(1)}% from last period
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <TrendingDown className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm text-red-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-gray-900">${reportData.expenses.current.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">
                          {reportData.expenses.trend === 'up' ? '+' : ''}
                          {((reportData.expenses.current - reportData.expenses.previous) / reportData.expenses.previous * 100).toFixed(1)}% from last period
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Profit Margin Trend</h4>
                  <div className="h-64 flex items-center justify-center">
                    <LineChart className="h-16 w-16 text-gray-400" />
                    <p className="ml-4 text-gray-600">Chart visualization would appear here</p>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'commission' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <Calculator className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm text-purple-600">Total Commission Earned</p>
                        <p className="text-2xl font-bold text-gray-900">${reportData.commission.current.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">
                          {reportData.commission.trend === 'up' ? '+' : ''}
                          {((reportData.commission.current - reportData.commission.previous) / reportData.commission.previous * 100).toFixed(1)}% from last period
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <PieChart className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm text-yellow-600">Avg. Commission Rate</p>
                        <p className="text-2xl font-bold text-gray-900">9.8%</p>
                        <p className="text-xs text-gray-600">Calculated across all agents</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Commission Distribution</h4>
                  <div className="h-64 flex items-center justify-center">
                    <PieChart className="h-16 w-16 text-gray-400" />
                    <p className="ml-4 text-gray-600">Chart visualization would appear here</p>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'tax' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-indigo-600" />
                      <div className="ml-4">
                        <p className="text-sm text-indigo-600">Taxable Income</p>
                        <p className="text-2xl font-bold text-gray-900">$98,450.00</p>
                        <p className="text-xs text-gray-600">Based on current period</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <div className="flex items-center">
                      <FileBarChart className="h-8 w-8 text-pink-600" />
                      <div className="ml-4">
                        <p className="text-sm text-pink-600">Estimated Tax</p>
                        <p className="text-2xl font-bold text-gray-900">$19,690.00</p>
                        <p className="text-xs text-gray-600">At 20% tax rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-center">
                      <Wallet className="h-8 w-8 text-teal-600" />
                      <div className="ml-4">
                        <p className="text-sm text-teal-600">Net After Tax</p>
                        <p className="text-2xl font-bold text-gray-900">$78,760.00</p>
                        <p className="text-xs text-gray-600">Estimated net income</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Tax Calculation Summary</h4>
                  <div className="h-64 flex items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-gray-400" />
                    <p className="ml-4 text-gray-600">Tax report visualization would appear here</p>
                  </div>
                </div>
              </div>
            )}

            {/* Other report previews would be similar */}
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}