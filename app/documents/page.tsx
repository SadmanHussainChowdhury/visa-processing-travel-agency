'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter,
  Upload,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  Image,
  Archive,
  Calendar,
  Tag,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

interface Document {
  _id: string;
  documentId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  url: string;
  clientId?: string;
  clientName?: string;
  visaCaseId?: string;
  tags: string[];
  category: 'passport' | 'visa' | 'insurance' | 'photo' | 'application' | 'financial' | 'medical' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  version: number;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 documents per page

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'passport', label: 'Passport' },
    { value: 'visa', label: 'Visa' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'photo', label: 'Photos' },
    { value: 'application', label: 'Applications' },
    { value: 'financial', label: 'Financial' },
    { value: 'medical', label: 'Medical' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' }
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.clientName && doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  // Pagination logic
  const indexOfLastDocument = currentPage * itemsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - itemsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      passport: 'bg-blue-100 text-blue-800',
      visa: 'bg-purple-100 text-purple-800',
      insurance: 'bg-green-100 text-green-800',
      photo: 'bg-pink-100 text-pink-800',
      application: 'bg-indigo-100 text-indigo-800',
      financial: 'bg-yellow-100 text-yellow-800',
      medical: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteDocument = async (document: Document) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`/api/documents/${document._id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setDocuments(prevDocuments => prevDocuments.filter(d => d._id !== document._id));
          alert('Document deleted successfully');
        } else {
          const errorData = await response.json();
          alert('Failed to delete document: ' + (errorData.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Document Management" 
          description="Manage all client documents and files"
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
        title="Document Management" 
        description="Upload, organize, and manage all client documents"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {filteredDocuments.length} documents
            </span>
            {filteredDocuments.length > itemsPerPage && (
              <span className="text-sm text-gray-600">
                Showing {indexOfFirstDocument + 1}-{Math.min(indexOfLastDocument, filteredDocuments.length)} of {filteredDocuments.length}
              </span>
            )}
          </div>
          <Link
            href="/documents/upload"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Filters</span>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Category & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDocuments.map((document) => (
                  <tr 
                    key={document._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/documents/${document._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(document.mimeType)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{document.fileName}</div>
                          <div className="text-sm text-gray-500">{document.documentId}</div>
                          <div className="text-xs text-gray-400">{formatFileSize(document.fileSize)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {document.clientName || 'N/A'}
                      </div>
                      {document.visaCaseId && (
                        <div className="text-xs text-gray-500">Case: {document.visaCaseId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(document.category)}`}>
                          {document.category}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatDate(document.uploadedAt)}</div>
                      <div className="text-gray-500">by {document.uploadedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {document.expiryDate ? (
                        <div className={new Date(document.expiryDate) < new Date() ? 'text-red-600' : ''}>
                          {formatDate(document.expiryDate)}
                        </div>
                      ) : (
                        <div className="text-gray-500">No expiry</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/documents/${document._id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/documents/${document._id}/edit`);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(document);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-700">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by uploading a new document.'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Link
                      href="/documents/upload"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Document</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstDocument + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastDocument, filteredDocuments.length)}</span> of{' '}
                  <span className="font-medium">{filteredDocuments.length}</span> results
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
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}