'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Image,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  X,
  Plus
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

interface Client {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function UploadDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{file: File, url: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    visaCaseId: '',
    category: 'other',
    status: 'pending',
    tags: [] as string[],
    expiryDate: '',
    notes: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [clients, setClients] = useState<Client[]>([]);

  const categories = [
    { value: 'passport', label: 'Passport', icon: FileText },
    { value: 'visa', label: 'Visa Documents', icon: FileText },
    { value: 'insurance', label: 'Insurance', icon: FileText },
    { value: 'photo', label: 'Photos', icon: Image },
    { value: 'application', label: 'Applications', icon: FileText },
    { value: 'financial', label: 'Financial Documents', icon: FileText },
    { value: 'health-clearance', label: 'Health Clearance', icon: FileText },
    { value: 'other', label: 'Other Documents', icon: FileText }
  ];

  const fileTypes = {
    'image/*': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'text/plain': ['txt']
  };

  const maxSize = 10 * 1024 * 1024; // 10MB

  const getAllowedExtensions = () => {
    return Object.values(fileTypes).flat().join(', ');
  };

  const validateFile = (file: File) => {
    const errors: Record<string, string> = {};

    // Check file size
    if (file.size > maxSize) {
      errors.file = `File size must be less than 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = getAllowedExtensions().split(', ');
    
    if (extension && !allowedExtensions.includes(extension)) {
      errors.file = `Invalid file type. Allowed types: ${getAllowedExtensions()}`;
    }

    return errors;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = [];
      const newPreviews: {file: File, url: string}[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileErrors = validateFile(file);
        if (Object.keys(fileErrors).length > 0) {
          setErrors({ ...errors, [`file_${i}`]: fileErrors.file });
          continue;
        }
        
        newFiles.push(file);
        
        // Create preview URL for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviewUrls(prev => [...prev, { file, url: e.target?.result as string }]);
          };
          reader.readAsDataURL(file);
        }
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setErrors({});
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles: File[] = [];
      const newPreviews: {file: File, url: string}[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileErrors = validateFile(file);
        if (Object.keys(fileErrors).length > 0) {
          setErrors({ ...errors, [`file_${i}`]: fileErrors.file });
          continue;
        }
        
        newFiles.push(file);
        
        // Create preview URL for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviewUrls(prev => [...prev, { file, url: e.target?.result as string }]);
          };
          reader.readAsDataURL(file);
        }
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setErrors({});
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

    if (selectedFiles.length === 0) {
      newErrors.file = 'Please select at least one file to upload';
    }

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

    setUploading(true);

    try {
      // In a real app, you would upload the file to a storage service
      // For now, we'll simulate the upload and create a document record
      
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create document records for each selected file
      for (const file of selectedFiles) {
        const preview = previewUrls.find(p => p.file === file);
        
        const documentData = {
          fileName: file.name,
          originalName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          filePath: `/uploads/${file.name}`, // This would be the actual path
          url: preview?.url || '#', // This would be the actual URL
          clientId: formData.clientId,
          clientName: formData.clientName,
          visaCaseId: formData.visaCaseId,
          category: formData.category,
          status: formData.status,
          tags: formData.tags,
          expiryDate: formData.expiryDate || undefined,
          notes: formData.notes,
          uploadedBy: 'current-user-id', // This would come from session
          uploadedAt: new Date().toISOString()
        };

        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          alert('Failed to upload document: ' + (errorData.error || 'Unknown error'));
          return; // Stop if any document fails to upload
        }
      }
      
      alert(`${selectedFiles.length} document(s) uploaded successfully!`);
      router.push('/documents');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Network error occurred while uploading document');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Upload Document" 
        description="Upload and categorize client documents"
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

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-8">
              {/* File Upload Section */}
              <div>
                <div className="flex items-center mb-4">
                  <Upload className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Select Document</h2>
                </div>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    errors.file 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={Object.keys(fileTypes).join(',')}
                    onChange={handleFileSelect}
                    multiple
                  />
                  
                  {selectedFiles.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedFiles.map((file, index) => {
                          const preview = previewUrls.find(p => p.file === file);
                          return (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              {preview && (
                                <img 
                                  src={preview.url} 
                                  alt="Preview" 
                                  className="max-h-32 mx-auto rounded-lg shadow-sm"
                                />
                              )}
                              <div className="mt-2">
                                <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)} • {file.type}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Remove file from both lists
                                  const newFiles = selectedFiles.filter((_, i) => i !== index);
                                  setSelectedFiles(newFiles);
                                  
                                  if (preview) {
                                    const newPreviews = previewUrls.filter(p => p.file !== file);
                                    setPreviewUrls(newPreviews);
                                  }
                                  
                                  // Reset input if no files left
                                  if (newFiles.length === 0 && fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className="text-xs text-red-600 hover:text-red-800 mt-1"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getAllowedExtensions().toUpperCase()} up to 10MB each
                      </p>
                      <p className="text-xs text-gray-500">
                        You can select multiple files at once
                      </p>
                    </div>
                  )}
                </div>
                
                {errors.file && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.file}
                  </p>
                )}
              </div>

              {/* Client & Document Details */}
              <div>
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                      <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
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
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Document Settings</h2>
                    <span className="ml-2 text-sm text-gray-500">(applied to all {selectedFiles.length} selected files)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
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
                  rows={3}
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
                  disabled={uploading || selectedFiles.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}