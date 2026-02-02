'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Tag,
  Eye,
  Edit,
  Trash2,
  Download,
  Archive,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  MoreVertical
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

interface DocumentData {
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
  category: string;
  status: string;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  version: number;
  previousVersions: {
    version: number;
    fileName: string;
    filePath: string;
    uploadedAt: string;
    uploadedBy: string;
  }[];
  notes?: string;
  isArchived: boolean;
  archivedAt?: string;
  archivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentDetailViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id);
    }
  }, [params.id]);

  const fetchDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (response.ok) {
        const data: DocumentData = await response.json();
        setDocument(data);
      } else {
        setError('Failed to fetch document');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Error fetching document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/documents/${document?._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Document deleted successfully');
          router.push('/documents');
        } else {
          alert('Failed to delete document');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document');
      }
    }
  };

  const handleArchive = async () => {
    if (confirm('Are you sure you want to archive this document?')) {
      try {
        const response = await fetch(`/api/documents/${document?._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isArchived: !document?.isArchived,
            archivedAt: document?.isArchived ? null : new Date().toISOString(),
            archivedBy: document?.isArchived ? null : 'current-user', // Would come from session
            updatedAt: new Date().toISOString()
          }),
        });
        
        if (response.ok) {
          alert(document?.isArchived ? 'Document unarchived successfully' : 'Document archived successfully');
          fetchDocument(document?._id || '');
        } else {
          alert('Failed to update document');
        }
      } catch (error) {
        console.error('Error archiving document:', error);
        alert('Error archiving document');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
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
      healthClearance: 'bg-red-100 text-red-800',
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Document Details" 
          description="Loading document information..."
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Document Details" 
          description="Error loading document"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <Link href="/documents" className="text-blue-600 hover:underline mt-2 inline-block">
              Back to Documents
            </Link>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (!document) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Document Details" 
          description="Document not found"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">Document not found.</p>
            <Link href="/documents" className="text-blue-600 hover:underline mt-2 inline-block">
              Back to Documents
            </Link>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={`Document: ${document.fileName}`} 
        description={`View details for document ${document.documentId}`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/documents"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documents
              </Link>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.open(document.url, '_blank')}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
              <Link
                href={`/documents/${document._id}/edit`}
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleArchive}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  document.isArchived 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Archive className="h-4 w-4" />
                <span>{document.isArchived ? 'Unarchive' : 'Archive'}</span>
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Document Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">Document Preview</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
                    {document.mimeType.startsWith('image/') ? (
                      <img 
                        src={document.url} 
                        alt={document.fileName}
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No preview available</p>
                        <button
                          onClick={() => window.open(document.url, '_blank')}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Open Document
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(document.url, '_blank')}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => {
                        // Trigger actual file download
                        const link = window.document.createElement('a');
                        link.href = document.url;
                        link.download = document.originalName;
                        window.document.body.appendChild(link);
                        link.click();
                        window.document.body.removeChild(link);
                      }}
                      className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Document History */}
              {document.previousVersions && document.previousVersions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <div className="flex items-center mb-4">
                    <History className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold">Version History</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {document.previousVersions.slice(0, 3).map((version, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Version {version.version}</div>
                          <div className="text-gray-500">{formatDate(version.uploadedAt)}</div>
                        </div>
                        <button
                          onClick={() => window.open(version.filePath, '_blank')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                      </div>
                    ))}
                    {document.previousVersions.length > 3 && (
                      <div className="text-center text-sm text-gray-500">
                        +{document.previousVersions.length - 3} more versions
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Document Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold">Document Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Document ID</div>
                    <div className="font-medium">{document.documentId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Original Name</div>
                    <div className="font-medium">{document.originalName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">File Type</div>
                    <div className="font-medium">{document.fileType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">File Size</div>
                    <div className="font-medium">{formatFileSize(document.fileSize)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Category</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(document.category)}`}>
                      {document.category}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className="flex items-center">
                      {getStatusIcon(document.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                        {document.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Version</div>
                    <div className="font-medium">v{document.version}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Archived</div>
                    <div className="font-medium">
                      {document.isArchived ? (
                        <span className="text-red-600">Yes</span>
                      ) : (
                        <span className="text-green-600">No</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              {(document.clientName || document.clientId) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold">Client Information</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {document.clientName && (
                      <div>
                        <div className="text-sm text-gray-500">Client Name</div>
                        <div className="font-medium">{document.clientName}</div>
                      </div>
                    )}
                    {document.clientId && (
                      <div>
                        <div className="text-sm text-gray-500">Client ID</div>
                        <div className="font-medium">{document.clientId}</div>
                      </div>
                    )}
                    {document.visaCaseId && (
                      <div>
                        <div className="text-sm text-gray-500">Visa Case ID</div>
                        <div className="font-medium">{document.visaCaseId}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold">Timeline</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Uploaded</div>
                    <div className="font-medium">{formatDate(document.uploadedAt)}</div>
                    <div className="text-sm text-gray-500">by {document.uploadedBy}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="font-medium">{formatDate(document.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="font-medium">{formatDate(document.updatedAt)}</div>
                  </div>
                  {document.expiryDate && (
                    <div>
                      <div className="text-sm text-gray-500">Expires</div>
                      <div className={`font-medium ${new Date(document.expiryDate) < new Date() ? 'text-red-600' : ''}`}>
                        {formatDate(document.expiryDate)}
                      </div>
                    </div>
                  )}
                  {document.isArchived && document.archivedAt && (
                    <div>
                      <div className="text-sm text-gray-500">Archived</div>
                      <div className="font-medium">{formatDate(document.archivedAt)}</div>
                      {document.archivedBy && (
                        <div className="text-sm text-gray-500">by {document.archivedBy}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <Tag className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="text-lg font-semibold">Tags</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {document.notes && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold">Notes</h3>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{document.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}