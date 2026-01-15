'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  User,
  Calendar,
  Tag,
  AlertCircle,
  X,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import ProtectedRoute from '../../../protected-route';
import SidebarLayout from '../../../components/sidebar-layout';

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
  category: string;
  status: string;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  version: number;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditDocumentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    clientName: '',
    visaCaseId: '',
    category: 'other',
    status: 'pending',
    tags: [] as string[],
    expiryDate: '',
    notes: ''
  });
  const [tagInput, setTagInput] = useState('');

  const categories = [
    { value: 'passport', label: 'Passport' },
    { value: 'visa', label: 'Visa Documents' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'photo', label: 'Photos' },
    { value: 'application', label: 'Applications' },
    { value: 'financial', label: 'Financial Documents' },
    { value: 'medical', label: 'Medical Records' },
    { value: 'other', label: 'Other Documents' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' }
  ];

  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id);
    }
  }, [params.id]);

  const fetchDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
        
        // Set form data
        setFormData({
          clientName: data.clientName || '',
          visaCaseId: data.visaCaseId || '',
          category: data.category || 'other',
          status: data.status || 'pending',
          tags: data.tags || [],
          expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : '',
          notes: data.notes || ''
        });
      } else {
        alert('Failed to fetch document');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      alert('Error fetching document');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/documents/${document?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert('Document updated successfully!');
        router.push('/documents');
      } else {
        const errorData = await response.json();
        alert('Failed to update document: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Network error occurred while updating document');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Edit Document" 
          description="Loading document information..."
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (!document) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Edit Document" 
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
        title="Edit Document" 
        description={`Editing ${document.fileName}`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/documents"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Preview Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
                    {document.mimeType.startsWith('image/') ? (
                      <img 
                        src={document.url} 
                        alt={document.fileName}
                        className="max-h-full max-w-full rounded-lg"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 truncate">{document.fileName}</h4>
                    <p className="text-sm text-gray-500">{document.documentId}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(document.fileSize)}</p>
                    <p className="text-sm text-gray-500">Version {document.version}</p>
                  </div>
                  
                  <div className="flex space-x-2 pt-4 border-t">
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
                        link.download = document.fileName;
                        window.document.body.appendChild(link);
                        link.click();
                        window.document.body.removeChild(link);
                      }}
                      className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Document History</h4>
                    <div className="text-sm text-gray-600">
                      <p>Uploaded: {formatDate(document.uploadedAt)}</p>
                      <p>By: {document.uploadedBy}</p>
                      <p>Created: {formatDate(document.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form Panel */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-8">
                  {/* Document Details */}
                  <div>
                    <div className="flex items-center mb-4">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">Document Details</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                          Client Name *
                        </label>
                        <input
                          type="text"
                          id="clientName"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.clientName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter client name"
                        />
                        {errors.clientName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.clientName}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="visaCaseId" className="block text-sm font-medium text-gray-700 mb-2">
                          Visa Case ID (Optional)
                        </label>
                        <input
                          type="text"
                          id="visaCaseId"
                          name="visaCaseId"
                          value={formData.visaCaseId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter visa case ID"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                          Document Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {categories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date (Optional)
                        </label>
                        <input
                          type="date"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Tag className="w-5 h-5 text-purple-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any additional notes about this document..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                    <Link
                      href="/documents"
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}