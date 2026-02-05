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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 commissions per page

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
    { value: 'john-doe', label: 'John Doe' },
    { value: 'jane-smith', label: 'Jane Smith' },
    { value: 'mike-johnson', label: 'Mike Johnson' }
  ];

  const periods = [
    { value: 'all', label: 'All Periods' },
    { value: 'jan-2024', label: 'January 2024' },
    { value: 'feb-2024', label: 'February 2024' },
    { value: 'mar-2024', label: 'March 2024' },
    { value: 'q1-2024', label: 'Q1 2024' }
  ];

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.month.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = selectedAgent === 'all' || commission.agent === selectedAgent;
    const matchesPeriod = selectedPeriod === 'all' || commission.month === selectedPeriod;
    return matchesSearch && matchesAgent && matchesPeriod;
  });

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAgent, selectedPeriod]);

  // Pagination logic
  const indexOfLastCommission = currentPage * itemsPerPage;
  const indexOfFirstCommission = indexOfLastCommission - itemsPerPage;
  const currentCommissions = filteredCommissions.slice(indexOfFirstCommission, indexOfLastCommission);
  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 1) {
      // Always show page 1 when there are results but only one page
      pageNumbers.push(1);
    } else {
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show first page
        pageNumbers.push(1);
        
        if (currentPage > 3) {
          pageNumbers.push('...');
        }
        
        // Show current page and surrounding pages
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
          if (i !== 1 && i !== totalPages) {
            pageNumbers.push(i);
          }
        }
        
        if (currentPage < totalPages - 2) {
          pageNumbers.push('...');
        }
        
        // Show last page
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const getTotalCommission = () => {
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
        <SidebarLayout title="Commission Management" description="Loading commissions...">
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
              <span className="text-sm font-medium text-green-600">
                Total Commission: ${getTotalCommission().toFixed(2)}
              </span>
              <span className="text-sm font-medium text-blue-600">
                Total Transactions: {getTotalTransactions()}
              </span>
            </div>
            {filteredCommissions.length > itemsPerPage && (
              <span className="text-sm text-gray-600">
                Showing {indexOfFirstCommission + 1}-{Math.min(indexOfLastCommission, filteredCommissions.length)} of {filteredCommissions.length}
              </span>
            )}
          </div>
          <button
            onClick={() => alert('Exporting commission report...')}
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
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
                {currentCommissions.map((commission) => (
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
                      {commission.paymentDate ? new Date(commission.paymentDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                          title="View Details"
                        >
                          <FileBarChart className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 hover:underline"
                          title="Edit Commission"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredCommissions.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstCommission + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastCommission, filteredCommissions.length)}</span> of{' '}
              <span className="font-medium">{filteredCommissions.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="ml-2">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {getPageNumbers().map((number, index) => (
                  <button
                    key={index}
                    onClick={() => typeof number === 'number' && paginate(number)}
                    className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      number === currentPage
                        ? 'z-10 bg-blue-600 text-white border-blue-600'
                        : typeof number === 'string'
                        ? 'text-gray-400 bg-white border-gray-300 cursor-default'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                    disabled={typeof number === 'string'}
                  >
                    {number}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage >= totalPages
                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">Next</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCommissions.length === 0 && (
          <div className="text-center py-12">
            <Calculator className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No commission records found</h3>
            <p className="mt-1 text-sm text-gray-700">
              {searchTerm || selectedAgent !== 'all' || selectedPeriod !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Commission records will appear here once transactions are processed.'
              }
            </p>
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
}
