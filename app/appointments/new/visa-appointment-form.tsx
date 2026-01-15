'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import SearchableClientSelect from '../../components/SearchableClientSelect';

interface Client {
  _id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface VisaAppointmentFormData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  consultantName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  visaType: string;
  purpose: string;
  notes: string;
  status: string;
}

export default function VisaAppointmentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'client' | 'appointment' | 'details' | 'review'>('client');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<VisaAppointmentFormData>({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    consultantName: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'visa-consultation',
    visaType: '',
    purpose: '',
    notes: '',
    status: 'scheduled'
  });

  const appointmentTypes = [
    { value: 'visa-consultation', label: 'Visa Consultation' },
    { value: 'document-review', label: 'Document Review' },
    { value: 'interview-preparation', label: 'Interview Preparation' },
    { value: 'follow-up', label: 'Follow-up Meeting' },
    { value: 'application-submission', label: 'Application Submission' },
    { value: 'status-update', label: 'Status Update' }
  ];

  const visaTypes = [
    { value: 'tourist', label: 'Tourist Visa' },
    { value: 'business', label: 'Business Visa' },
    { value: 'student', label: 'Student Visa' },
    { value: 'work', label: 'Work Visa' },
    { value: 'transit', label: 'Transit Visa' },
    { value: 'family', label: 'Family/Spouse Visa' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
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

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId: client._id,
        clientName: `${client.firstName} ${client.lastName}`,
        clientEmail: client.email,
        clientPhone: client.phone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clientId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email address';
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Client phone is required';
    }

    if (!formData.consultantName.trim()) {
      newErrors.consultantName = 'Consultant name is required';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Appointment time is required';
    }

    if (!formData.visaType.trim()) {
      newErrors.visaType = 'Visa type is required';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose of visit is required';
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
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone
        }),
      });

      if (response.ok) {
        router.push('/appointments');
      } else {
        const errorData = await response.json();
        console.error('Error creating appointment:', errorData);
        alert('Failed to create appointment: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Network error occurred while creating appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/appointments');
  };

  const nextTab = () => {
    const tabs = ['client', 'appointment', 'details', 'review'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1] as any);
    }
  };

  const prevTab = () => {
    const tabs = ['client', 'appointment', 'details', 'review'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1] as any);
    }
  };

  const isTabValid = (tab: string) => {
    switch (tab) {
      case 'client':
        return formData.clientName && formData.clientEmail && formData.clientPhone;
      case 'appointment':
        return formData.consultantName && formData.appointmentDate && formData.appointmentTime && formData.visaType;
      case 'details':
        return formData.purpose;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="New Visa Appointment" 
        description="Schedule a new visa consultation appointment"
      >
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appointments
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { id: 'client', label: 'Client Info', icon: User },
                { id: 'appointment', label: 'Appointment Details', icon: Calendar },
                { id: 'details', label: 'Additional Info', icon: FileText },
                { id: 'review', label: 'Review', icon: CheckCircle }
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
                  {index < 3 && (
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
                { id: 'client', label: 'Client Info', icon: User },
                { id: 'appointment', label: 'Appointment Details', icon: Calendar },
                { id: 'details', label: 'Additional Info', icon: FileText },
                { id: 'review', label: 'Review', icon: CheckCircle }
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
              {/* Client Information Tab */}
              {activeTab === 'client' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
                  </div>
                  
                  {/* Client Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Client *
                    </label>
                    <SearchableClientSelect
                      value={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ''}
                      onChange={handleClientSelect}
                      placeholder="Search and select a client"
                      className="w-full"
                    />
                    {errors.clientName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.clientName}
                      </p>
                    )}
                  </div>

                  {/* Manual Client Entry */}
                  <div className="border-t pt-6">
                    <div className="flex items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Manual Client Entry</h3>
                      <span className="ml-2 text-sm text-gray-500">(or)</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          placeholder="client@example.com"
                        />
                        {errors.clientEmail && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.clientEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-2">
                          Client Phone *
                        </label>
                        <input
                          type="tel"
                          id="clientPhone"
                          name="clientPhone"
                          value={formData.clientPhone}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.clientPhone ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="+1-555-123-4567"
                        />
                        {errors.clientPhone && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.clientPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment Details Tab */}
              {activeTab === 'appointment' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Calendar className="w-6 h-6 text-green-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="consultantName" className="block text-sm font-medium text-gray-700 mb-2">
                        Consultant Name *
                      </label>
                      <input
                        type="text"
                        id="consultantName"
                        name="consultantName"
                        value={formData.consultantName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.consultantName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter consultant name"
                      />
                      {errors.consultantName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.consultantName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Type
                      </label>
                      <select
                        id="appointmentType"
                        name="appointmentType"
                        value={formData.appointmentType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {appointmentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Date *
                      </label>
                      <input
                        type="date"
                        id="appointmentDate"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.appointmentDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.appointmentDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.appointmentDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Time *
                      </label>
                      <input
                        type="time"
                        id="appointmentTime"
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.appointmentTime ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.appointmentTime && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.appointmentTime}
                        </p>
                      )}
                    </div>

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
                        {visaTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.visaType && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.visaType}
                        </p>
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
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-purple-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose of Visit *
                      </label>
                      <textarea
                        id="purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.purpose ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Describe the purpose of this visa appointment..."
                      />
                      {errors.purpose && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.purpose}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional information about the appointment..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Review Tab */}
              {activeTab === 'review' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Review Appointment</h2>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Client Information</h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Name:</span> {formData.clientName || 'Not provided'}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Email:</span> {formData.clientEmail || 'Not provided'}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Phone:</span> {formData.clientPhone || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Appointment Details</h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Consultant:</span> {formData.consultantName || 'Not provided'}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Type:</span> {appointmentTypes.find(t => t.value === formData.appointmentType)?.label || 'Not selected'}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Visa Type:</span> {visaTypes.find(v => v.value === formData.visaType)?.label || 'Not selected'}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Date:</span> {formData.appointmentDate || 'Not selected'}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Time:</span> {formData.appointmentTime || 'Not selected'}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Status:</span> {statusOptions.find(s => s.value === formData.status)?.label || 'Not selected'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {formData.purpose && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Purpose of Visit</h3>
                        <p className="text-sm text-gray-600">{formData.purpose}</p>
                      </div>
                    )}
                    
                    {formData.notes && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                        <p className="text-sm text-gray-600">{formData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <div>
                {activeTab !== 'client' && (
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
                
                {activeTab !== 'review' ? (
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
                        Creating Appointment...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Appointment
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