'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  DollarSign, 
  BarChart3, 
  FileBarChart, 
  Download,
  Filter,
  Search,
  Calendar,
  Users,
  CreditCard,
  PiggyBank,
  Wallet,
  Receipt,
  Edit3,
  Trash2
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function CommissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/accounting/commissions');
        if (response.ok) {
          const data = await response.json();
          setCommissions(data);
        } else {
          console.error('Failed to fetch commissions');
        }
      } catch (error) {
        console.error('Error fetching commissions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommissions();
  }, []);

  const agents = [
    { value: 'all', label: 'All Agents' },
    { value: 'Agent 1', label: 'Agent 1' },
    { value: 'Agent 2', label: 'Agent 2' },
    { value: 'Agent 3', label: 'Agent 3' },
    { value: 'Agent 4', label: 'Agent 4' }
  ];

  const periods = [
    { value: 'all', label: 'All Periods' },
    { value: 'January 2024', label: 'January 2024' },
    { value: 'December 2023', label: 'December 2023' },
    { value: 'November 2023', label: 'November 2023' }
  ];

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.month.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = selectedAgent === 'all' || commission.agent === selectedAgent;
    const matchesPeriod = selectedPeriod === 'all' || commission.month === selectedPeriod;
    return matchesSearch && matchesAgent && matchesPeriod;
  });

  const handleDeleteCommission = (commissionId: string) => {
    if (confirm('Are you sure you want to delete this commission record? This action cannot be undone.')) {
      setCommissions(prev => prev.filter(c => c.id !== commissionId));
    }
  };

  const getTotalCommissionEarned = () => {
    return filteredCommissions.reduce((sum, c) => sum + c.commissionEarned, 0);
  };

  const getTotalTransactions = () => {
    return filteredCommissions.reduce((sum, c) => sum + c.transactions, 0);
  };

  const getTotalAmount = () => {
    return filteredCommissions.reduce((sum, c) => sum + c.totalAmount, 0);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Commission Management" description="Loading commission data...">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Commission Management" 
        description="Track and manage agent commissions"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              {filteredCommissions.length} {filteredCommissions.length === 1 ? 'record' : 'records'}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Total Commission: <span className="text-blue-600">${getTotalCommissionEarned().toFixed(2)}</span>
              </span>
              <span className="text-sm font-medium text-gray-700">
                Total Transactions: <span className="text-green-600">{getTotalTransactions()}</span>
              </span>
              <span className="text-sm font-medium text-gray-700">
                Total Amount: <span className="text-purple-600">${getTotalAmount().toFixed(2)}</span>
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search commissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              >
                {agents.map(agent => (
                  <option key={agent.value} value={agent.value}>
                    {agent.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4"></div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Commission Records */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rate (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Commission Earned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.agent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.transactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">${commission.totalAmount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{commission.commissionRate}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${commission.commissionEarned.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        commission.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.paymentDate ? new Date(commission.paymentDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                          title="Edit Commission"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCommission(commission.id)}
                          className="text-red-600 hover:text-red-900 hover:underline"
                          title="Delete Commission"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Commission Earned</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalCommissionEarned().toFixed(2)}</p>
                <p className="text-xs text-gray-600">Across all records</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalTransactions()}</p>
                <p className="text-xs text-gray-600">Handled by agents</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalAmount().toFixed(2)}</p>
                <p className="text-xs text-gray-600">Generated by agents</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredCommissions.length === 0 && (
          <div className="text-center py-12">
            <Calculator className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No commission records found</h3>
            <p className="mt-1 text-sm text-gray-700">
              {searchTerm || selectedAgent !== 'all' || selectedPeriod !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by calculating commissions for your agents.'
              }
            </p>
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
}