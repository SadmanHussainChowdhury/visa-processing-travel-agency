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
  User,
  Heart
} from 'lucide-react';
import SidebarLayout from '../../components/sidebar-layout';
import { useTranslations } from '../../hooks/useTranslations';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';

// Server-side data fetching
async function getClient(id: string) {
  try {
    await dbConnect();
    const client = await Client.findById(id);
    return JSON.parse(JSON.stringify(client));
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  const { t } = useTranslations();

  if (!client) {
    return (
      <SidebarLayout title="Client Not Found" description="The requested client could not be found">
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Client not found</h3>
          <p className="mt-1 text-sm text-gray-500">The client you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link
              href="/clients"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <SidebarLayout 
      title={`${client.firstName} ${client.lastName}`} 
      description="Client details and information"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link 
              href="/clients" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Clients
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-gray-600">Client ID: {client.clientId || client._id}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/clients/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Link>
          </div>
        </div>

        {/* Client Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">First Name</label>
                <p className="mt-1 text-sm text-gray-900">{client.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{client.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{client.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{client.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="mt-1 text-sm text-gray-900">
                  {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Gender</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{client.gender || 'N/A'}</p>
              </div>
              {client.address && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{client.address}</p>
                </div>
              )}
              {(client.city || client.state || client.zipCode) && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Location</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {[client.city, client.state, client.zipCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status and Dates */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor('Active')}`}>
                    {t('profile.active')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Registration Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {client.emergencyContact && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{client.emergencyContact.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{client.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Relationship</label>
                    <p className="mt-1 text-sm text-gray-900">{client.emergencyContact.relationship}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visa Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Visa Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Passport Number</label>
              <p className="mt-1 text-sm text-gray-900">{client.passportNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Passport Country</label>
              <p className="mt-1 text-sm text-gray-900">{client.passportCountry}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Visa Type</label>
              <p className="mt-1 text-sm text-gray-900">{client.visaType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Application Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {client.visaApplicationDate ? new Date(client.visaApplicationDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            {client.visaExpirationDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Expiration Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(client.visaExpirationDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {(client.specialRequirements?.length > 0 || 
          client.currentApplications?.length > 0 || 
          client.travelHistory?.length > 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              {client.specialRequirements?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Special Requirements</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {client.specialRequirements.map((req: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {client.currentApplications?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Current Applications</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {client.currentApplications.map((app: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {client.travelHistory?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Travel History</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {client.travelHistory.map((history: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {history}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}