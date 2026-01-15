'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Globe, 
  AlertCircle,
  Users,
  Calendar,
  Flag
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

interface VisaCaseFormData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  visaType: string;
  country: string;
  priority: string;

  expectedDecisionDate: string;
  notes: string;
}

export default function NewVisaCasePage() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<VisaCaseFormData>({
    clientId: '',
    clientName: '',
    clientEmail: '',
    visaType: '',
    country: '',
    priority: 'medium',

    expectedDecisionDate: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

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



  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId: client._id,
        clientName: `${client.firstName} ${client.lastName}`,
        clientEmail: client.email
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clientId: '',
        clientName: '',
        clientEmail: ''
      }));
    }
  };

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
      const response = await fetch('/api/visa-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        }),
      });

      if (response.ok) {
        alert('Visa case created successfully!');
        router.push('/visa-cases');
      } else {
        const errorData = await response.json();
        alert('Failed to create visa case: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating visa case:', error);
      alert('Network error occurred while creating visa case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Create New Visa Case" 
        description="Start a new visa application process"
      >
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/visa-cases"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Visa Cases
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
                    <h3 className="text-lg font-medium text-gray-900">Or Enter Client Details Manually</h3>
                    <span className="ml-2 text-sm text-gray-500">(optional if selecting above)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name
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
                    </div>
                    
                    <div>
                      <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Client Email
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
                  <h2 className="text-xl font-semibold text-gray-900">Additional Notes</h2>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Case Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any additional information about this visa case..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Link
                  href="/visa-cases"
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
                  <span>{isSubmitting ? 'Creating...' : 'Create Visa Case'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}