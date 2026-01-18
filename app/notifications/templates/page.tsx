'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Search,
  Filter,
  Bell
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function MessageTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/notification-templates');
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

  const templateTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' }
  ];

  const templateCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'status-update', label: 'Status Updates' },
    { value: 'document-alert', label: 'Document Alerts' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'payment', label: 'Payment' },
    { value: 'reminder', label: 'Reminders' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleDuplicateTemplate = (template: any) => {
    const duplicatedTemplate = {
      ...template,
      id: `copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, duplicatedTemplate]);
    alert(`Template "${template.name}" duplicated successfully`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Message Templates" description="Loading templates...">
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
        title="Message Templates" 
        description="Manage templates for common notifications and messages"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
            </span>
          </div>
          <Link
            href="/notifications/templates/new"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
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
                  placeholder="Search templates..."
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
                {templateTypes.map(type => (
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
                {templateCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Variables
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {template.type === 'email' ? <Mail className="h-5 w-5 text-blue-600" /> : <MessageSquare className="h-5 w-5 text-green-600" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{template.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {template.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {templateCategories.find(c => c.value === template.category)?.label}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded">
                            {variable}
                          </span>
                        ))}
                        {template.variables.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                            +{template.variables.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/notifications/templates/${template.id}`}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                          title="View Template"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <Link 
                          href={`/notifications/templates/${template.id}/edit`}
                          className="text-green-600 hover:text-green-900 hover:underline"
                          title="Edit Template"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDuplicateTemplate(template)}
                          className="text-purple-600 hover:text-purple-900 hover:underline"
                          title="Duplicate Template"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-900 hover:underline"
                          title="Delete Template"
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
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-700">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new message template.'
              }
            </p>
            {(!searchTerm && selectedType === 'all' && selectedCategory === 'all') && (
              <div className="mt-6">
                <Link
                  href="/notifications/templates/new"
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