'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Calculator, 
  BarChart3, 
  FileBarChart, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Download,
  Filter,
  Search,
  Calendar,
  Users,
  PiggyBank,
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import { useTranslations } from '../hooks/useTranslations';

export default function AccountingPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'expenses'>('overview');
  const [dateRange, setDateRange] = useState('this-month');
  const [searchTerm, setSearchTerm] = useState('');

  const [accountingData, setAccountingData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    commissionEarned: 0,
    pendingInvoices: 0,
    overdueInvoices: 0
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [commissionData, setCommissionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredTransactions = transactions.filter(transaction => {
    return transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (transaction.client && transaction.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const calculateTotals = () => {
    const totalRevenue = transactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    setAccountingData({
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      commissionEarned: commissionData.reduce((sum, c) => sum + c.commissionEarned, 0),
      pendingInvoices: 0,
      overdueInvoices: 0
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch accounting data
      const accountingRes = await fetch('/api/accounting');
      if (accountingRes.ok) {
        const accountingData = await accountingRes.json();
        // Use the fetched data
        setAccountingData({
          totalRevenue: accountingData.totalRevenue || 0,
          totalExpenses: accountingData.totalExpenses || 0,
          netProfit: accountingData.netProfit || 0,
          profitMargin: accountingData.totalRevenue > 0 ? (accountingData.netProfit / accountingData.totalRevenue) * 100 : 0,
          commissionEarned: accountingData.totalCommissionEarned || 0,
          pendingInvoices: 0,
          overdueInvoices: 0
        });
      }
      
      // Fetch transactions
      const transactionsRes = await fetch('/api/accounting/transactions');
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }
      
      // Fetch commissions
      const commissionsRes = await fetch('/api/accounting/commissions');
      if (commissionsRes.ok) {
        const commissionsData = await commissionsRes.json();
        setCommissionData(commissionsData);
      }
    } catch (error) {
      console.error('Error fetching accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  useEffect(() => {
    calculateTotals();
  }, [transactions, commissionData]);

  useEffect(() => {
    const handleTransactionCreated = () => {
      fetchData();
    };
    
    window.addEventListener('transactionCreated', handleTransactionCreated);
    
    return () => {
      window.removeEventListener('transactionCreated', handleTransactionCreated);
    };
  }, [fetchData]);

  const handleExportReport = (reportType: string) => {
    alert(`Exporting ${reportType} report...`);
    // In a real implementation, this would generate and download the report
  };

  const refreshAccountingData = async () => {
    setLoading(true);
    try {
      // Fetch accounting data
      const accountingRes = await fetch('/api/accounting');
      if (accountingRes.ok) {
        const accountingData = await accountingRes.json();
        // Use the fetched data
        setAccountingData({
          totalRevenue: accountingData.totalRevenue || 0,
          totalExpenses: accountingData.totalExpenses || 0,
          netProfit: accountingData.netProfit || 0,
          profitMargin: accountingData.totalRevenue > 0 ? (accountingData.netProfit / accountingData.totalRevenue) * 100 : 0,
          commissionEarned: accountingData.totalCommissionEarned || 0,
          pendingInvoices: 0,
          overdueInvoices: 0
        });
      }
      
      // Fetch transactions
      const transactionsRes = await fetch('/api/accounting/transactions');
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }
      
      // Fetch commissions
      const commissionsRes = await fetch('/api/accounting/commissions');
      if (commissionsRes.ok) {
        const commissionsData = await commissionsRes.json();
        setCommissionData(commissionsData);
      }
    } catch (error) {
      console.error('Error refreshing accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Accounting & Finance" 
        description="Manage revenue, expenses, commissions, and financial reports"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/accounting/transactions/new"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Transaction</span>
            </Link>
            <button
              onClick={() => handleExportReport('profit-margin')}
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Reports</span>
            </button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${accountingData.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-600">+12.5% from last month</p>
              </div>
              <button 
                onClick={refreshAccountingData}
                className="p-2 text-gray-500 hover:text-gray-700 ml-2"
                title="Refresh Data"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="p-3 bg-blue-500 rounded-lg ml-2">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${accountingData.totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-gray-600">-3.2% from last month</p>
              </div>
              <button 
                onClick={refreshAccountingData}
                className="p-2 text-gray-500 hover:text-gray-700 ml-2"
                title="Refresh Data"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="p-3 bg-red-500 rounded-lg ml-2">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">${accountingData.netProfit.toFixed(2)}</p>
                <p className="text-xs text-gray-600">+15.7% from last month</p>
              </div>
              <button 
                onClick={refreshAccountingData}
                className="p-2 text-gray-500 hover:text-gray-700 ml-2"
                title="Refresh Data"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="p-3 bg-green-500 rounded-lg ml-2">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{accountingData.profitMargin.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">+2.3% from last month</p>
              </div>
              <button 
                onClick={refreshAccountingData}
                className="p-2 text-gray-500 hover:text-gray-700 ml-2"
                title="Refresh Data"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="p-3 bg-purple-500 rounded-lg ml-2">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: DollarSign },
              { id: 'revenue', label: 'Revenue', icon: TrendingUp },
              { id: 'expenses', label: 'Expenses', icon: TrendingDown }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                    <Link href="/accounting/transactions" className="text-sm text-blue-600 hover:text-blue-800">
                      View All
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'revenue' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {transaction.client ? `Client: ${transaction.client}` : transaction.category}
                            </div>
                            <div className="text-xs text-gray-400">{transaction.date}</div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commission Summary */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Commission Summary</h3>
                    <Link href="/accounting/commissions" className="text-sm text-blue-600 hover:text-blue-800">
                      View All
                    </Link>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <Calculator className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm text-blue-600">Total Commission Earned</p>
                        <p className="text-xl font-bold text-gray-900">${accountingData.commissionEarned.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">This period</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Top Performing Agents</h4>
                      <div className="space-y-2">
                        {commissionData.slice(0, 3).map((comm) => (
                          <div key={comm.id} className="flex justify-between text-sm">
                            <span>{comm.agent}</span>
                            <span className="font-medium">${comm.commissionEarned.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-600">Pending Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{accountingData.pendingInvoices}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-xs text-red-600">Overdue Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{accountingData.overdueInvoices}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="p-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search revenue transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions
                      .filter(t => t.type === 'revenue')
                      .map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.client || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {transaction.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            +${transaction.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="p-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expense transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions
                      .filter(t => t.type === 'expense')
                      .map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              {transaction.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            -${transaction.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
