'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Briefcase
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

export default function VisaCasesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  const [visaCases, setVisaCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 visa cases per page

  useEffect(() => {
    const fetchVisaCases = async () => {
      try {
        const response = await fetch('/api/visa-cases');
        if (response.ok) {
          const data = await response.json();
          setVisaCases(data);
        }
      } catch (error) {
        console.error('Error fetching visa cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisaCases();
  }, []);

  const filteredCases = visaCases.filter(visaCase => {
    const matchesSearch = visaCase.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visaCase.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visaCase.visaType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visaCase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination logic
  const indexOfLastCase = currentPage * itemsPerPage;
  const indexOfFirstCase = indexOfLastCase - itemsPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in-process':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewCase = (visaCase: any) => {
    router.push(`/visa-cases/${visaCase._id}`);
  };

  const handleEditCase = (visaCase: any) => {
    router.push(`/visa-cases/${visaCase._id}/edit`);
  };

  const handleDeleteCase = async (visaCase: any) => {
    if (confirm(`Are you sure you want to delete visa case ${visaCase.caseId}?`)) {
      try {
        const response = await fetch(`/api/visa-cases/${visaCase._id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setVisaCases(prevVisaCases => prevVisaCases.filter(c => c._id !== visaCase._id));
          alert('Visa case deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting visa case:', error);
        alert('Failed to delete visa case');
      }
    }
  };

  const toggleActionsMenu = (caseId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowActionsMenu(showActionsMenu === caseId ? null : caseId);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Visa Cases" 
          description="Manage all visa applications"
        >
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
        title="Visa Cases" 
        description="Manage all visa applications and track their progress"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {filteredCases.length} cases
            </span>
            {filteredCases.length > itemsPerPage && (
              <span className="text-sm text-gray-600">
                Showing {indexOfFirstCase + 1}-{Math.min(indexOfLastCase, filteredCases.length)} of {filteredCases.length}
              </span>
            )}
          </div>
          <Link
            href="/visa-cases/new"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Case</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="in-process">In Process</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            

            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Filters</span>
            </div>
          </div>
        </div>

        {/* Visa Cases List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Case Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status & Priority
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCases.map((visaCase) => (
                  <tr 
                    key={visaCase._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewCase(visaCase)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{visaCase.caseId}</div>
                          <div className="text-sm text-gray-700">{visaCase.clientName}</div>
                          <div className="text-xs text-gray-500 capitalize">{visaCase.visaType} • {visaCase.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visaCase.status)}`}>
                          {visaCase.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(visaCase.priority)}`}>
                          {visaCase.priority}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Applied: {new Date(visaCase.applicationDate).toLocaleDateString()}</div>
                        {visaCase.submissionDate && (
                          <div className="text-gray-500">Submitted: {new Date(visaCase.submissionDate).toLocaleDateString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCase(visaCase);
                          }}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          View
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCase(visaCase);
                          }}
                          className="text-green-600 hover:text-green-900 hover:underline"
                        >
                          Edit
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActionsMenu(visaCase._id, e);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {showActionsMenu === visaCase._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowActionsMenu(null);
                                    handleViewCase(visaCase);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowActionsMenu(null);
                                    handleEditCase(visaCase);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit Case
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowActionsMenu(null);
                                    handleDeleteCase(visaCase);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Delete Case
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {filteredCases.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstCase + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastCase, filteredCases.length)}</span> of{' '}
                  <span className="font-medium">{filteredCases.length}</span> results
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

            {filteredCases.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No visa cases found</h3>
                <p className="mt-1 text-sm text-gray-700">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating a new visa case.'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Link
                      href="/visa-cases/new"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create New Case</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
