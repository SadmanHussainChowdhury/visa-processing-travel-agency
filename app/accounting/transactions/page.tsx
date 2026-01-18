'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Calculator, 
  FileBarChart, 
  Plus, 
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

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/accounting/transactions');
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          console.error('Failed to fetch transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  const transactionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'expense', label: 'Expense' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Service Fees', label: 'Service Fees' },
    { value: 'Premium Services', label: 'Premium Services' },
    { value: 'Consultation', label: 'Consultation' },
    { value: 'Office Expenses', label: 'Office Expenses' },
    { value: 'Software', label: 'Software' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Marketing', label: 'Marketing' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'this-year', label: 'This Year' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    }
  };

  const getTotalRevenue = () => {
    return filteredTransactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getNetAmount = () => {
    return getTotalRevenue() - getTotalExpenses();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Accounting Transactions" description="Loading transactions...">
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
        title="Accounting Transactions" 
        description="Manage all revenue and expense transactions"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-600">
                Revenue: ${getTotalRevenue().toFixed(2)}
              </span>
              <span className="text-sm font-medium text-red-600">
                Expenses: ${getTotalExpenses().toFixed(2)}
              </span>
              <span className="text-sm font-medium text-blue-600">
                Net: ${getNetAmount().toFixed(2)}
              </span>
            </div>
          </div>
          <Link
            href="/accounting/transactions/new"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Transaction</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              >
                {transactionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4"></div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.client?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'revenue' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'revenue' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                          title="Edit Transaction"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-900 hover:underline"
                          title="Delete Transaction"
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

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-700">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new transaction.'
              }
            </p>
            {(!searchTerm && selectedType === 'all' && selectedCategory === 'all') && (
              <div className="mt-6">
                <Link
                  href="/accounting/transactions/new"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Transaction</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
}