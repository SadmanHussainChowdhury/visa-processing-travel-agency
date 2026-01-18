'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import ProtectedRoute from '../../../protected-route';
import SidebarLayout from '../../../components/sidebar-layout';

export default function NewTemplatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'preview'>('basic');

  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    category: 'status-update',
    subject: '',
    content: '',
    variables: [] as string[]
  });

  const templateTypes = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' }
  ];

  const templateCategories = [
    { value: 'status-update', label: 'Status Updates' },
    { value: 'document-alert', label: 'Document Alerts' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'payment', label: 'Payment' },
    { value: 'reminder', label: 'Reminders' },
    { value: 'welcome', label: 'Welcome Messages' },
    { value: 'follow-up', label: 'Follow-ups' }
  ];

  const commonVariables = [
    'clientName',
    'agencyName',
    'visaType',
    'applicationId',
    'appointmentDate',
    'appointmentTime',
    'dueDate',
    'amountPaid',
    'reason'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addVariable = (variable: string) => {
    if (!formData.variables.includes(variable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variable]
      }));
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Template type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.type === 'email' && !formData.subject.trim()) {
      newErrors.subject = 'Subject is required for email templates';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to create template
      const response = await fetch('/api/notification-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Template created successfully!');
        router.push('/notifications/templates');
      } else {
        const errorData = await response.json();
        console.error('Error creating template:', errorData);
        alert('Failed to create template: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Network error occurred while creating template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/notifications/templates');
  };

  const nextTab = () => {
    const tabs = ['basic', 'content', 'preview'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1] as any);
    }
  };

  const prevTab = () => {
    const tabs = ['basic', 'content', 'preview'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1] as any);
    }
  };

  const isTabValid = (tab: string) => {
    switch (tab) {
      case 'basic':
        return formData.name && formData.type && formData.category;
      case 'content':
        return formData.content && (formData.type !== 'email' || formData.subject);
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Create New Message Template" 
        description="Design a reusable template for common notifications"
      >
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { id: 'basic', label: 'Basic Info', icon: FileText },
                { id: 'content', label: 'Content', icon: FileText },
                { id: 'preview', label: 'Preview', icon: CheckCircle }
              ].map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    activeTab === step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isTabValid(step.id)
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      activeTab === step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isTabValid(step.id) ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'basic', label: 'Basic Information', icon: FileText },
                { id: 'content', label: 'Template Content', icon: FileText },
                { id: 'preview', label: 'Preview', icon: CheckCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter template name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Template Type *
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.type ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {templateTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.type}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {templateCategories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject (for Email)
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.subject ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter email subject"
                        disabled={formData.type !== 'email'}
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.subject}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Template Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <FileText className="w-6 h-6 text-green-600 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-900">Template Content</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Content Editor */}
                    <div className="lg:col-span-2">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows={12}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                          errors.content ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={`Enter your template content here...\n\nUse variables like {{clientName}}, {{visaType}}, etc.`}
                      ></textarea>
                      {errors.content && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.content}
                        </p>
                      )}
                    </div>

                    {/* Variables Panel */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Available Variables</h3>
                      
                      <div className="space-y-2">
                        {commonVariables.map(variable => (
                          <div 
                            key={variable}
                            className={`flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                              formData.variables.includes(variable) 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200'
                            }`}
                            onClick={() => addVariable(variable)}
                          >
                            <span className="font-mono text-sm">{`{{${variable}}}`}</span>
                            {formData.variables.includes(variable) && (
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <h3 className="font-medium text-gray-900 mb-2">Selected Variables</h3>
                        
                        {formData.variables.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No variables selected</p>
                        ) : (
                          <div className="space-y-2">
                            {formData.variables.map(variable => (
                              <div 
                                key={variable}
                                className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded"
                              >
                                <span className="font-mono text-sm">{`{{${variable}}}`}</span>
                                <button
                                  type="button"
                                  onClick={() => removeVariable(variable)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="w-6 h-6 text-purple-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Template Preview</h2>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formData.name || 'Template Preview'}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {formData.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <span>Category: {templateCategories.find(c => c.value === formData.category)?.label}</span>
                      </div>
                    </div>

                    {formData.type === 'email' && formData.subject && (
                      <div className="mb-4 p-4 bg-white rounded-lg border">
                        <div className="font-medium text-gray-900 mb-2">Subject:</div>
                        <div className="text-gray-700">{formData.subject}</div>
                      </div>
                    )}

                    <div className="bg-white p-6 rounded-lg border">
                      <div className="prose max-w-none">
                        <p>{formData.content.replace(/\{\{(\w+)\}\}/g, (match, p1) => `[${p1}]`)}</p>
                      </div>
                    </div>

                    {formData.variables.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-900">Variables</h4>
                            <ul className="mt-1 text-sm text-blue-800 space-y-1">
                              {formData.variables.map((variable, index) => (
                                <li key={index}>• {`{{${variable}}}`} - {variable.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <div>
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={prevTab}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                
                {activeTab !== 'preview' ? (
                  <button
                    type="button"
                    onClick={nextTab}
                    disabled={!isTabValid(activeTab)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Template...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Template
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}