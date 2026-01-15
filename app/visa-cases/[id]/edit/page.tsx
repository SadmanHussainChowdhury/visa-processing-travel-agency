'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Globe, 

  Calendar, 
  Flag,
  AlertCircle,
  Upload,
  FileCheck
} from 'lucide-react';
import ProtectedRoute from '../../../protected-route';
import SidebarLayout from '../../../components/sidebar-layout';


interface Client {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface VisaCaseFormData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  visaType: string;
  country: string;
  status: string;
  priority: string;
  applicationDate: string;
  submissionDate: string;
  decisionDate: string;
  expectedDecisionDate: string;
  notes: string[];
}

export default function EditVisaCasePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [visaCase, setVisaCase] = useState<any>(null);
  const [formData, setFormData] = useState<VisaCaseFormData>({
    clientId: '',
    clientName: '',
    clientEmail: '',
    visaType: '',
    country: '',
    status: 'draft',
    priority: 'medium',
    applicationDate: new Date().toISOString().split('T')[0],
    submissionDate: '',
    decisionDate: '',
    expectedDecisionDate: '',
    notes: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const visaTypes = [
    { value: 'tourist', label: 'Tourist Visa' },
    { value: 'business', label: 'Business Visa' },
    { value: 'student', label: 'Student Visa' },
    { value: 'work', label: 'Work Visa' },
    { value: 'transit', label: 'Transit Visa' },
    { value: 'family', label: 'Family/Spouse Visa' }
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
    'France', 'Japan', 'South Korea', 'Singapore', 'New Zealand'
  ];



  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'in-process', label: 'In Process' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    const fetchVisaCase = async () => {
      try {
        const response = await fetch(`/api/visa-cases/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setVisaCase(data);
          
          // Set form data from fetched visa case
          setFormData({
            clientId: data.clientId || '',
            clientName: data.clientName || '',
            clientEmail: data.clientEmail || '',
            visaType: data.visaType || '',
            country: data.country || '',
            status: data.status || 'draft',
            priority: data.priority || 'medium',
            applicationDate: data.applicationDate ? new Date(data.applicationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            submissionDate: data.submissionDate ? new Date(data.submissionDate).toISOString().split('T')[0] : '',
            decisionDate: data.decisionDate ? new Date(data.decisionDate).toISOString().split('T')[0] : '',
            expectedDecisionDate: data.expectedDecisionDate ? new Date(data.expectedDecisionDate).toISOString().split('T')[0] : '',
            notes: data.notes || []
          });
        } else {
          alert('Failed to fetch visa case');
        }
      } catch (error) {
        console.error('Error fetching visa case:', error);
        alert('Error fetching visa case');
      } finally {
        setLoading(false);
      }
    };

    fetchVisaCase();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const note = e.target.value;
    if (note.trim()) {
      setFormData(prev => ({
        ...prev,
        notes: [...(prev.notes || []), note.trim()]
      }));
      e.target.value = '';
    }
  };

  const removeNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.filter((_: any, i: number) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email address';
    }

    if (!formData.visaType) {
      newErrors.visaType = 'Visa type is required';
    }

    if (!formData.country) {
      newErrors.country = 'Destination country is required';
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
      const response = await fetch(`/api/visa-cases/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assignedAgent: undefined,
          assignedTeam: undefined
        }),
      });

      if (response.ok) {
        alert('Visa case updated successfully!');
        router.push(`/visa-cases/${params.id}`);
      } else {
        const errorData = await response.json();
        alert('Failed to update visa case: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating visa case:', error);
      alert('Network error occurred while updating visa case');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Edit Visa Case" 
          description="Loading visa case information..."
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
        title="Edit Visa Case" 
        description={`Update details for case ${visaCase?.caseId}`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={`/visa-cases/${params.id}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Case Details
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-8">
              {/* Client Information */}
              <div>
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
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
                      placeholder="Enter client full name"
                    />
                    {errors.clientName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.clientName}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Client Email *
                    </label>
                    <input
                      type="email"
                      id="clientEmail"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.clientEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter client email"
                    />
                    {errors.clientEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Visa Details */}
              <div>
                <div className="flex items-center mb-6">
                  <Globe className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Visa Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="visaType" className="block text-sm font-medium text-gray-700 mb-2">
                      Visa Type *
                    </label>
                    <select
                      id="visaType"
                      name="visaType"
                      value={formData.visaType}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.visaType ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select visa type</option>
                      {visaTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {errors.visaType && (
                      <p className="mt-1 text-sm text-red-600">{errors.visaType}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Country *
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
                      <option value="">Select country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                    )}
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
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="applicationDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Application Date
                    </label>
                    <input
                      type="date"
                      id="applicationDate"
                      name="applicationDate"
                      value={formData.applicationDate}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Date
                    </label>
                    <input
                      type="date"
                      id="submissionDate"
                      name="submissionDate"
                      value={formData.submissionDate}
                      onChange={handleInputChange}
                      min={formData.applicationDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="decisionDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Decision Date
                    </label>
                    <input
                      type="date"
                      id="decisionDate"
                      name="decisionDate"
                      value={formData.decisionDate}
                      onChange={handleInputChange}
                      min={formData.submissionDate || formData.applicationDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="expectedDecisionDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Decision Date
                    </label>
                    <input
                      type="date"
                      id="expectedDecisionDate"
                      name="expectedDecisionDate"
                      value={formData.expectedDecisionDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>



              {/* Notes */}
              <div>
                <div className="flex items-center mb-6">
                  <Flag className="w-6 h-6 text-yellow-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Case Notes</h2>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Note
                  </label>
                  <textarea
                    onChange={handleNotesChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a note about this case..."
                  />
                </div>
                
                {formData.notes && formData.notes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Existing Notes
                    </label>
                    <div className="space-y-2">
                      {formData.notes.map((note: string, index: number) => (
                        <div key={index} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm">{note}</span>
                          <button
                            type="button"
                            onClick={() => removeNote(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Link
                  href={`/visa-cases/${params.id}`}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? 'Updating...' : 'Update Visa Case'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}