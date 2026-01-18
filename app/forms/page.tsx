'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Globe,
  User,
  CheckCircle,
  Edit3,
  Trash2,
  Eye,
  Copy
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import { useTranslations } from '../hooks/useTranslations';

export default function FormsPage() {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/forms');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          console.error('Failed to fetch templates');
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const countries = [
    { code: 'all', name: 'All Countries' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'JP', name: 'Japan' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.templateId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || template.country.includes(selectedCountry);
    return matchesSearch && matchesCountry;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleViewTemplate = (template: any) => {
    setSelectedTemplate(template);
    window.location.href = `/forms/${template._id}`;
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    window.location.href = `/forms/${template._id}/edit`;
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      // Get the original template from the API to ensure we have all data
      const response = await fetch(`/api/forms/${template._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template for duplication');
      }
      
      const originalTemplate = await response.json();
      
      // Prepare the new template data with modified fields
      const newTemplateData = {
        ...originalTemplate,
        name: `${originalTemplate.name} (Copy)`,
        templateId: `COPY-${originalTemplate.templateId}`,
        status: 'draft', // New copies start as draft
      };
      
      // Create the new template via API
      const createResponse = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTemplateData),
      });
      
      if (createResponse.ok) {
        const newTemplate = await createResponse.json();
        setTemplates(prev => [...prev, newTemplate]);
        alert(`Template "${template.name}" duplicated successfully`);
        // Close the actions menu after duplication
        setShowActionsMenu(null);
      } else {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create duplicated template');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert(`Failed to duplicate template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteTemplate = async (template: any) => {
    if (confirm(`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/forms/${template._id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setTemplates(prev => prev.filter(t => t._id !== template._id));
          alert(`Template "${template.name}" deleted successfully`);
          // Close the actions menu after deletion
          setShowActionsMenu(null);
        } else {
          const errorData = await response.json();
          alert(`Failed to delete template: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Network error occurred while deleting template');
      }
    }
  };

  const handleExportTemplate = async (template: any) => {
    try {
      // Open a new window/tab to trigger the export
      window.open(`/api/forms/${template._id}/export`, '_blank');
    } catch (error) {
      console.error('Error exporting template:', error);
      alert(`Failed to export template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleActionsMenu = (templateId: string) => {
    setShowActionsMenu(showActionsMenu === templateId ? null : templateId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest && !target.closest('.actions-menu')) {
        setShowActionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Form Library & Templates" 
        description="Manage pre-configured visa application forms"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
            </span>
          </div>
          <Link
            href="/forms/new"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Last Modified
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading templates...
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => (
                    <tr key={template._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500">ID: {template.templateId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{template.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{template.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {template.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(template.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(template.status)}`}>
                          {template.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewTemplate(template)}
                            className="text-blue-600 hover:text-blue-900 hover:underline"
                            title="View Template"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditTemplate(template)}
                            className="text-green-600 hover:text-green-900 hover:underline"
                            title="Edit Template"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <div className="relative actions-menu">
                            <button 
                              onClick={() => toggleActionsMenu(template._id)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                              title="More Actions"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                            
                            {showActionsMenu === template._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleExportTemplate(template)}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateTemplate(template)}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTemplate(template)}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-700">
              {searchTerm || selectedCountry !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new form template.'
              }
            </p>
            {(!searchTerm && selectedCountry === 'all') && (
              <div className="mt-6">
                <Link
                  href="/forms/new"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Template</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
}