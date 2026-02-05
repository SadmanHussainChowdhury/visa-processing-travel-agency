'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  FileText,
  Eye,
  Briefcase,
  DollarSign,
  FolderOpen
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

type Client = {
  _id: string;
  clientId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string | Date;
  address?: string;
  nationality?: string;
  occupation?: string;
  createdAt?: string | Date;
  passportNumber?: string;
  passportIssueDate?: string | Date;
  passportExpiryDate?: string | Date;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
};

type VisaCase = {
  _id: string;
  caseId?: string;
  visaType?: string;
  country?: string;
  status?: string;
};

type Appointment = {
  _id: string;
  clientId?: string;
  appointmentDate?: string | Date;
  appointmentTime?: string;
  appointmentType?: string;
  status?: string;
};

type Invoice = {
  _id: string;
  invoiceNumber?: string;
  status?: string;
  currency?: string;
  totalAmount?: number;
};

type Document = {
  _id: string;
  documentId?: string;
  fileName?: string;
  originalName?: string;
  category?: string;
  status?: string;
};

type ClientTab = 'details' | 'visa-cases' | 'appointments' | 'billing' | 'documents';

export default function ClientViewPage() {
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visaCases, setVisaCases] = useState<VisaCase[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingVisaCases, setLoadingVisaCases] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [activeTab, setActiveTab] = useState<ClientTab>('details');
  const [appointmentTab, setAppointmentTab] = useState<'upcoming' | 'previous'>('upcoming');

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

  // Fetch related data for this client
  useEffect(() => {
    const fetchVisaCases = async () => {
      if (!client?._id) return;
      try {
        setLoadingVisaCases(true);
        const response = await fetch(`/api/visa-cases?clientId=${client._id}`);
        if (response.ok) {
          const data = await response.json();
          setVisaCases(data || []);
        }
      } catch (error) {
        console.error('Error fetching visa cases:', error);
      } finally {
        setLoadingVisaCases(false);
      }
    };

    const fetchAppointments = async () => {
      if (!client?._id) return;
      try {
        setLoadingAppointments(true);
        const response = await fetch('/api/appointments');
        if (response.ok) {
          const data = await response.json();
          const filtered = (data || []).filter((appt: Appointment) => appt.clientId === client._id);
          setAppointments(filtered);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    const fetchInvoices = async () => {
      if (!client?._id) return;
      try {
        setLoadingInvoices(true);
        const response = await fetch(`/api/billing/invoices?clientId=${client._id}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setInvoices(data?.invoices || []);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoadingInvoices(false);
      }
    };

    const fetchDocuments = async () => {
      if (!client?._id) return;
      try {
        setLoadingDocuments(true);
        const response = await fetch(`/api/documents?clientId=${client._id}`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data || []);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    if (params.id && client) {
      fetchVisaCases();
      fetchAppointments();
      fetchInvoices();
      fetchDocuments();
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
              The client you&apos;re looking for doesn&apos;t exist or has been removed.
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

  const getAppointmentDate = (appointment: Appointment) => {
    if (!appointment?.appointmentDate) return null;
    if (appointment.appointmentDate instanceof Date) {
      return isNaN(appointment.appointmentDate.getTime()) ? null : appointment.appointmentDate;
    }
    const time = appointment.appointmentTime || '00:00';
    const dateValue = String(appointment.appointmentDate);
    const dateString = dateValue.includes('T')
      ? dateValue
      : `${dateValue}T${time}`;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter((appt) => {
    const date = getAppointmentDate(appt);
    return date ? date >= now : false;
  });
  const previousAppointments = appointments.filter((appt) => {
    const date = getAppointmentDate(appt);
    return date ? date < now : false;
  });

  // Get status color for visa cases and invoices
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
      case 'inprogress':
      case 'in-process':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs: Array<{
    id: ClientTab;
    label: string;
    icon: typeof Users;
    count?: number;
  }> = [
    { id: 'details', label: 'Client Details', icon: Users },
    { id: 'visa-cases', label: 'Visa Cases', icon: FileText, count: visaCases.length },
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
    { id: 'billing', label: 'Billing', icon: DollarSign, count: invoices.length },
    { id: 'documents', label: 'Documents', icon: FolderOpen, count: documents.length },
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
                        onClick={() => setActiveTab(tab.id)}
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

            {/* Visa Cases Tab */}
            {activeTab === 'visa-cases' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Visa Cases</span>
                  </h2>
                  <Link
                    href="/visa-cases/new"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <span>New Case</span>
                  </Link>
                </div>
                {loadingVisaCases ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : visaCases.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No visa cases found for this client</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {visaCases.map((visaCase) => (
                          <tr key={visaCase._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visaCase.caseId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visaCase.visaType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visaCase.country}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(visaCase.status)}`}>
                                {visaCase.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/visa-cases/${visaCase._id}`}
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

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Appointments</span>
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAppointmentTab('upcoming')}
                      className={`px-3 py-2 text-sm rounded-lg ${appointmentTab === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setAppointmentTab('previous')}
                      className={`px-3 py-2 text-sm rounded-lg ${appointmentTab === 'previous' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Previous
                    </button>
                  </div>
                </div>
                {loadingAppointments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (appointmentTab === 'upcoming' ? upcomingAppointments : previousAppointments).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No {appointmentTab} appointments found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(appointmentTab === 'upcoming' ? upcomingAppointments : previousAppointments).map((appt) => (
                          <tr key={appt._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {appt.appointmentTime || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {appt.appointmentType || 'Consultation'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appt.status)}`}>
                                {appt.status || 'scheduled'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Billing</span>
                </h2>
                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No invoices found for this client</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.invoiceNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {invoice.currency} {invoice.totalAmount?.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/billing/${invoice._id}`}
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

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Documents</span>
                </h2>
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No documents found for this client</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                          <tr key={doc._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {doc.fileName || doc.originalName || doc.documentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{doc.category || 'general'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                                {doc.status || 'pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
