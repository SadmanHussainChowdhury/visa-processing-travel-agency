'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Globe, 
  User, 
  Edit3, 
  Download, 
  ArrowLeft, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

interface FormTemplate {
  _id: string;
  templateId: string;
  name: string;
  country: string;
  category: string;
  description?: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export default function FormTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/forms/${params.id}`);
        
        if (response.ok) {
          const templateData: FormTemplate = await response.json();
          setTemplate(templateData);
          setError(null);
        } else {
          setError('Failed to load form template');
          console.error('Failed to fetch template:', response.status);
        }
      } catch (err) {
        setError('Failed to load form template');
        console.error('Error fetching template:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id]);

  const handleExport = () => {
    // Open a new window/tab to trigger the export
    window.open(`/api/forms/${template?._id}/export`, '_blank');
  };

  const handleFillFromClient = async () => {
    try {
      // In a real implementation, this would fetch client data and pre-populate fields
      // For now, we'll just show a confirmation
      alert('Auto-fill from client database would populate the form with client information');
    } catch (error) {
      console.error('Error filling form from client data:', error);
      alert('Failed to auto-fill form from client database');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Form Template" description="Loading form template...">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error || !template) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Form Template" description="Error loading form template">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error || 'Form template not found'}</p>
            </div>
            <div className="mt-4">
              <Link
                href="/forms"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form Templates
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={template.name} 
        description={`Form template for ${template.country}`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/forms"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleFillFromClient}
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Auto-fill from Client</span>
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <Link
                href={`/forms/${template._id}/edit`}
                className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            </div>
          </div>

          {/* Template Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Template Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Template Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Template ID</div>
                    <div className="font-medium">{template.templateId}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Country</div>
                    <div className="flex items-center font-medium">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      {template.country}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Category</div>
                    <div className="font-medium">{template.category}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Version</div>
                    <div className="font-medium">{template.version}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      template.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : template.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Created</div>
                    <div className="flex items-center font-medium">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                    <div className="flex items-center font-medium">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {template.description && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Description</div>
                      <div className="font-medium text-gray-700">{template.description}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Form Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
                </div>
                
                <div className="space-y-4">
                  {template.fields.map((field) => (
                    <div key={field.id} className="p-4 bg-gray-50 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      )}

                      {field.type === 'email' && (
                        <input
                          type="email"
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      )}

                      {field.type === 'phone' && (
                        <input
                          type="tel"
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled
                        >
                          <option value="">{field.placeholder || 'Select an option...'}</option>
                          {field.options?.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                      )}

                      {field.type === 'checkbox' && (
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              disabled
                            />
                            <span className="ml-2 text-sm text-gray-700">{field.label}</span>
                          </label>
                        </div>
                      )}

                      {field.type === 'radio' && (
                        <div className="space-y-2">
                          {field.options?.map((option, idx) => (
                            <label key={idx} className="flex items-center">
                              <input
                                type="radio"
                                name={field.name}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                disabled
                              />
                              <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        ></textarea>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Field Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Field Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Required
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Options
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {template.fields.map((field) => (
                    <tr key={field.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{field.label}</div>
                        <div className="text-sm text-gray-500">{field.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {field.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {field.required ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {field.options && field.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {field.options.slice(0, 3).map((option, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded">
                                {option}
                              </span>
                            ))}
                            {field.options.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                                +{field.options.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}