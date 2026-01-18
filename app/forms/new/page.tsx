'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Globe, 
  User, 
  Lock, 
  Unlock, 
  Save, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle
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
  name: string;
  templateId: string;
  country: string;
  category: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  fields: FormField[];
}

export default function NewFormTemplatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'fields' | 'preview'>('basic');

  const [formData, setFormData] = useState<FormTemplate>({
    name: '',
    templateId: '',
    country: '',
    category: '',
    description: '',
    version: '2024',
    status: 'draft',
    fields: [
      {
        id: '1',
        name: 'fullName',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        defaultValue: ''
      },
      {
        id: '2',
        name: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true,
        defaultValue: ''
      }
    ]
  });

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
  ];

  const categories = [
    { value: 'tourist', label: 'Tourist Visa' },
    { value: 'business', label: 'Business Visa' },
    { value: 'student', label: 'Student Visa' },
    { value: 'work', label: 'Work Visa' },
    { value: 'transit', label: 'Transit Visa' },
    { value: 'family', label: 'Family/Spouse Visa' },
    { value: 'medical', label: 'Medical Visa' },
    { value: 'diplomatic', label: 'Diplomatic Visa' },
  ];

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'phone', label: 'Phone Input' },
    { value: 'date', label: 'Date Picker' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'textarea', label: 'Text Area' },
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

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: `field_${formData.fields.length + 1}`,
      type: 'text',
      label: `Field ${formData.fields.length + 1}`,
      required: false,
      defaultValue: ''
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const removeField = (id: string) => {
    if (formData.fields.length <= 1) {
      alert('At least one field is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== id)
    }));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    }));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const currentIndex = formData.fields.findIndex(f => f.id === id);
    if (direction === 'up' && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const newFields = [...formData.fields];
      [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
      setFormData(prev => ({ ...prev, fields: newFields }));
    } else if (direction === 'down' && currentIndex < formData.fields.length - 1) {
      const newIndex = currentIndex + 1;
      const newFields = [...formData.fields];
      [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
      setFormData(prev => ({ ...prev, fields: newFields }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.templateId.trim()) {
      newErrors.templateId = 'Template ID is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
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
      // Simulate API call to create the form template
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Form template created successfully!');
        router.push('/forms');
      } else {
        const errorData = await response.json();
        console.error('Error creating form template:', errorData);
        alert('Failed to create form template: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating form template:', error);
      alert('Network error occurred while creating form template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/forms');
  };

  const nextTab = () => {
    const tabs = ['basic', 'fields', 'preview'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1] as any);
    }
  };

  const prevTab = () => {
    const tabs = ['basic', 'fields', 'preview'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1] as any);
    }
  };

  const isTabValid = (tab: string) => {
    switch (tab) {
      case 'basic':
        return formData.name && formData.templateId && formData.country;
      case 'fields':
        return formData.fields.length > 0;
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Create New Form Template" 
        description="Design a new visa application form template"
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
                { id: 'fields', label: 'Form Fields', icon: User },
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
                { id: 'fields', label: 'Form Fields', icon: User },
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
                      <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
                        Template ID *
                      </label>
                      <input
                        type="text"
                        id="templateId"
                        name="templateId"
                        value={formData.templateId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.templateId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter unique template ID"
                      />
                      {errors.templateId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.templateId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.country ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.country}
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
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.value} value={category.label}>
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

                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the purpose of this form template..."
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                        Version
                      </label>
                      <input
                        type="text"
                        id="version"
                        name="version"
                        value={formData.version}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2024"
                      />
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
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields Tab */}
              {activeTab === 'fields' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <User className="w-6 h-6 text-green-600 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-900">Form Fields</h2>
                    </div>
                    <button
                      type="button"
                      onClick={addField}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Add Field</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-gray-900">Field {index + 1}</h3>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => moveField(field.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveField(field.id, 'down')}
                              disabled={index === formData.fields.length - 1}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                              title="Move down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeField(field.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Remove field"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Label *
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Field label"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Field name (for form processing)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type *
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {fieldTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Placeholder
                            </label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Placeholder text"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`required-${field.id}`}
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-900">
                              Required field
                            </label>
                          </div>

                          {(field.type === 'select' || field.type === 'radio') && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Options (one per line)
                              </label>
                              <textarea
                                value={field.options?.join('\n') || ''}
                                onChange={(e) => updateField(field.id, { 
                                  options: e.target.value.split('\n').filter(opt => opt.trim())
                                })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                              ></textarea>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="w-6 h-6 text-purple-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Preview Form</h2>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{formData.name || 'Untitled Form'}</h3>
                      <p className="text-sm text-gray-600">{formData.description || 'Form description'}</p>
                    </div>

                    <div className="space-y-4">
                      {formData.fields.map((field, index) => (
                        <div key={field.id} className="bg-white p-4 rounded-lg border">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>

                          {field.type === 'text' && (
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}

                          {field.type === 'email' && (
                            <input
                              type="email"
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}

                          {field.type === 'phone' && (
                            <input
                              type="tel"
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}

                          {field.type === 'date' && (
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}

                          {field.type === 'select' && (
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            ></textarea>
                          )}
                        </div>
                      ))}
                    </div>
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
                        Create Form Template
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