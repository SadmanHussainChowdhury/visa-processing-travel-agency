'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Globe,
  Flag,
  FileText,
  Clock,
  Eye,
  Trash2,
  Briefcase,
  IdCard,
  PlaneTakeoff,
  CreditCard
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function ClientViewPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visaApplications, setVisaApplications] = useState<any[]>([]);
  const [loadingVisaApplications, setLoadingVisaApplications] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'visa-applications' | 'travel-history' | 'financial-documents'>('details');

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          setError('Client not found');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        setError('Failed to fetch client data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClient();
    }
  }, [params.id]);

  // Fetch visa applications for this client
  useEffect(() => {
    const fetchVisaApplications = async () => {
      if (!params.id || !client) return;
      
      try {
        setLoadingVisaApplications(true);
        // In a real implementation, we would fetch visa applications from an API
        // For now, using mock data
        const mockVisaApplications = [
          {
            id: 'va-001',
            caseId: 'VC-001',
            visaType: 'Tourist',
            destinationCountry: 'United States',
            applicationDate: '2024-01-15',
            status: 'approved',
            submissionDate: '2024-01-20',
            decisionDate: '2024-02-01',
            notes: 'Standard tourist visa application'
          },
          {
            id: 'va-002',
            caseId: 'VC-002',
            visaType: 'Business',
            destinationCountry: 'Canada',
            applicationDate: '2024-02-10',
            status: 'in-progress',
            submissionDate: '2024-02-15',
            decisionDate: null,
            notes: 'Business visitor visa'
          }
        ];
        setVisaApplications(mockVisaApplications);
      } catch (error) {
        console.error('Error fetching visa applications:', error);
      } finally {
        setLoadingVisaApplications(false);
      }
    };

    if (params.id && client) {
      fetchVisaApplications();
    }
  }, [params.id, client]);

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Client Details" 
          description="View client information"
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error || !client) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Client Not Found" 
          description="The requested client could not be found"
        >
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Client not found</h3>
            <p className="mt-1 text-sm text-gray-700">
              The client you're looking for doesn't exist or has been removed.
            </p>
            <div className="mt-6">
              <Link
                href="/clients"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Clients</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  // Get status color for visa applications
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'details', label: 'Client Details', icon: Users },
    { id: 'visa-applications', label: 'Visa Applications', icon: IdCard, count: visaApplications.length },
    { id: 'travel-history', label: 'Travel History', icon: PlaneTakeoff, count: 0 },
    { id: 'financial-documents', label: 'Financial Documents', icon: CreditCard, count: 0 },
  ];

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Client Details" 
        description="View and manage client information"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/clients"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{client.firstName} {client.lastName}</h1>
              <Link
                href={`/clients/${client._id}/edit`}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Client</span>
              </Link>
            </div>
          </div>

          {/* Main Content with Vertical Tabs */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Vertical Tab Navigation - Left Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0 mb-4 lg:mb-0">
              <div className="bg-white rounded-lg shadow lg:sticky lg:top-6">
                <nav className="p-2" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full py-3 px-4 mb-1 rounded-lg font-medium text-sm flex items-center justify-between transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span>{tab.label}</span>
                        </div>
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            activeTab === tab.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content - Right Side */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg shadow">
                {/* Client Details Tab */}
                {activeTab === 'details' && (
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Users className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                <p className="text-sm text-gray-900">{client.firstName} {client.lastName}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Users className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Client ID</p>
                                <p className="text-sm text-gray-900 font-mono">{client.clientId || client._id}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Mail className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-sm text-gray-900">{client.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Phone className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-sm text-gray-900">{client.phone}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                                <p className="text-sm text-gray-900">
                                  {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'Not specified'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Address</p>
                                <p className="text-sm text-gray-900">{client.address || 'Not specified'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Globe className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Nationality</p>
                                <p className="text-sm text-gray-900">{client.nationality || 'Not specified'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Briefcase className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Occupation</p>
                                <p className="text-sm text-gray-900">{client.occupation || 'Not specified'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Registration Date</p>
                                <p className="text-sm text-gray-900">
                                  {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Not specified'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Passport Information */}
                      {client.passportNumber && (
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-4">Passport Information</h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Passport Number</p>
                              <p className="text-sm text-gray-900">{client.passportNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Issue Date</p>
                              <p className="text-sm text-gray-900">
                                {client.passportIssueDate ? new Date(client.passportIssueDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                              <p className="text-sm text-gray-900">
                                {client.passportExpiryDate ? new Date(client.passportExpiryDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      {client.emergencyContact && (
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Name</p>
                              <p className="text-sm text-gray-900">{client.emergencyContact.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Relationship</p>
                              <p className="text-sm text-gray-900">{client.emergencyContact.relationship}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p className="text-sm text-gray-900">{client.emergencyContact.phone}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

            {/* Visa Applications Tab */}
            {activeTab === 'visa-applications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <IdCard className="h-5 w-5" />
                  <span>Visa Applications</span>
                </h2>
                {loadingVisaApplications ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : visaApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <IdCard className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No visa applications found for this client</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {visaApplications.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.caseId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.visaType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.destinationCountry}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                                {application.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/visa-cases/${application.id}`}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Travel History Tab */}
            {activeTab === 'travel-history' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <PlaneTakeoff className="h-5 w-5" />
                  <span>Travel History</span>
                </h2>
                <div className="text-center py-8">
                  <PlaneTakeoff className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Travel history information coming soon</p>
                  <p className="text-xs text-gray-400 mt-1">This section will display the client's travel history</p>
                </div>
              </div>
            )}

            {/* Financial Documents Tab */}
            {activeTab === 'financial-documents' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Financial Documents</span>
                </h2>
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Financial documents information coming soon</p>
                  <p className="text-xs text-gray-400 mt-1">This section will display the client's financial documents</p>
                </div>
              </div>
            )}


              </div>
            </div>
          </div>
        </div>


      </SidebarLayout>
    </ProtectedRoute>
  );
}
