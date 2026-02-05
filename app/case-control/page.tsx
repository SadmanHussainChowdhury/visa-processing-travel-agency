'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/app/protected-route';
import SidebarLayout from '@/app/components/sidebar-layout';
import { 
  Lock, 
  Eye, 
  Edit, 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Upload,
  History,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
  X
} from 'lucide-react';

interface CaseApproval {
  id: string;
  caseId: string;
  applicantName: string;
  visaType: string;
  country?: string;
  status: 'pending' | 'approved' | 'rejected' | 'locked' | 'submitted';
  submittedDate?: string;
  lockedDate?: string;
  supervisorReview?: string;
  versionHistory: VersionEntry[];
  approvalSteps: ApprovalStep[];
}

interface VersionEntry {
  id: string;
  date: string;
  user: string;
  changes: string[];
  documentChanges: string[];
}

interface ApprovalStep {
  id: string;
  step: number;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedDate?: string;
  notes?: string;
}

const CaseControlPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [cases, setCases] = useState<CaseApproval[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showLockedCases, setShowLockedCases] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseApproval | null>(null);
  const [newCaseData, setNewCaseData] = useState({
    clientName: '',
    visaType: '',
    country: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'locked' | 'submitted',
    notes: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 cases per page

  // Define fetchData function outside useEffect
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/case-control`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCases(data);
      setFilteredCases(data);
    } catch (error) {
      console.error('Error fetching case control data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  // Filter cases based on search term and status
  useEffect(() => {
    let result = cases;

    if (searchTerm) {
      result = result.filter(c => 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.visaType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (!showLockedCases) {
      result = result.filter(c => c.status !== 'locked');
    }

    setFilteredCases(result);
  }, [cases, searchTerm, statusFilter, showLockedCases]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, showLockedCases]);

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

  const handleViewDetails = (caseId: string) => {
    router.push(`/case-control/${caseId}`);
  };

  const handleLockCase = async (caseId: string) => {
    try {
      const response = await fetch('/api/case-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lock', caseId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to lock case');
      }
      
      // Refresh the data
      await fetchData();
      alert(`Case ${caseId} has been locked. No further edits allowed.`);
    } catch (error) {
      console.error('Error locking case:', error);
      alert('Error locking case. Please try again.');
    }
  };

  const handleUnlockCase = async (caseId: string) => {
    try {
      const response = await fetch('/api/case-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlock', caseId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to unlock case');
      }
      
      // Refresh the data
      await fetchData();
      alert(`Case ${caseId} has been unlocked. Edits are now allowed.`);
    } catch (error) {
      console.error('Error unlocking case:', error);
      alert('Error unlocking case. Please try again.');
    }
  };

  const handleRequestCorrection = async (caseId: string) => {
    try {
      const response = await fetch('/api/case-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-correction', caseId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to request correction');
      }
      
      // Refresh the data
      await fetchData();
      alert(`Correction requested for case ${caseId}. Supervisor will be notified.`);
    } catch (error) {
      console.error('Error requesting correction:', error);
      alert('Error requesting correction. Please try again.');
    }
  };

  const handleAddNewCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/case-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCaseData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create case');
      }
      
      // Refresh the data
      await fetchData();
      setShowAddModal(false);
      setNewCaseData({
        clientName: '',
        visaType: '',
        country: '',
        status: 'pending',
        notes: ''
      });
      alert('Case created successfully!');
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Error creating case. Please try again.');
    }
  };

  const handleEditCase = (caseItem: CaseApproval) => {
    setEditingCase(caseItem);
    setNewCaseData({
      clientName: caseItem.applicantName,
      visaType: caseItem.visaType,
      country: caseItem.country || '',
      status: caseItem.status,
      notes: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase) return;
    
    try {
      const response = await fetch('/api/case-control', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCase.id,
          clientName: newCaseData.clientName,
          visaType: newCaseData.visaType,
          country: newCaseData.country,
          status: newCaseData.status
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update case');
      }
      
      // Refresh the data
      await fetchData();
      setShowEditModal(false);
      setEditingCase(null);
      setNewCaseData({
        clientName: '',
        visaType: '',
        country: '',
        status: 'pending',
        notes: ''
      });
      alert('Case updated successfully!');
    } catch (error) {
      console.error('Error updating case:', error);
      alert('Error updating case. Please try again.');
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/case-control?id=${caseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete case');
      }
      
      // Refresh the data
      await fetchData();
      alert('Case deleted successfully!');
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Error deleting case. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'locked': return 'bg-purple-100 text-purple-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'locked': return <Lock className="h-4 w-4" />;
      case 'submitted': return <FileText className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Case Control & Quality Assurance" description="Loading cases...">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Case Control & Quality Assurance" 
        description="Monitor and manage case approvals, quality assurance, and version history"
      >
        <div className="max-w-7xl mx-auto">
          {/* Filters and Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Cases
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by ID, name, or visa type..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="locked">Locked</option>
                  <option value="submitted">Submitted</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={showLockedCases}
                    onChange={(e) => setShowLockedCases(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Locked Cases</span>
                </label>
              </div>
              
              <div className="flex items-end space-x-2">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Case
                </button>
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visa Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{c.id}</div>
                        <div className="text-sm text-gray-500">{c.caseId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{c.applicantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {c.visaType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                          {getStatusIcon(c.status)}
                          <span className="ml-1 capitalize">{c.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.round((c.approvalSteps.filter(s => s.completed).length / c.approvalSteps.length) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-600">
                            {c.approvalSteps.filter(s => s.completed).length}/{c.approvalSteps.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(c.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          
                          {c.status !== 'locked' && (
                            <button
                              onClick={() => handleLockCase(c.id)}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Lock
                            </button>
                          )}
                          
                          {c.status === 'locked' && (
                            <button
                              onClick={() => handleUnlockCase(c.id)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Unlock
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEditCase(c)}
                            className="text-yellow-600 hover:text-yellow-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCase(c.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredCases.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            ) : (
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
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{cases.length}</h3>
                  <p className="text-sm text-gray-500">Total Cases</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'pending').length}</h3>
                  <p className="text-sm text-gray-500">Pending Approval</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'locked').length}</h3>
                  <p className="text-sm text-gray-500">Locked Cases</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'approved' || c.status === 'submitted').length}</h3>
                  <p className="text-sm text-gray-500">Approved/Submitted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Case Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Case</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddNewCase} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newCaseData.clientName}
                    onChange={(e) => setNewCaseData({...newCaseData, clientName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visa Type *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newCaseData.visaType}
                    onChange={(e) => setNewCaseData({...newCaseData, visaType: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newCaseData.country}
                    onChange={(e) => setNewCaseData({...newCaseData, country: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newCaseData.status}
                    onChange={(e) => setNewCaseData({...newCaseData, status: e.target.value as any})}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="locked">Locked</option>
                    <option value="submitted">Submitted</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Case
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Case Modal */}
        {showEditModal && editingCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Case</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateCase} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newCaseData.clientName}
                    onChange={(e) => setNewCaseData({...newCaseData, clientName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visa Type *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newCaseData.visaType}
                    onChange={(e) => setNewCaseData({...newCaseData, visaType: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newCaseData.country}
                    onChange={(e) => setNewCaseData({...newCaseData, country: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newCaseData.status}
                    onChange={(e) => setNewCaseData({...newCaseData, status: e.target.value as any})}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="locked">Locked</option>
                    <option value="submitted">Submitted</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Case
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
};

export default CaseControlPage;
