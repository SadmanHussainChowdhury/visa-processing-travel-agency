'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Globe, 
  Calendar, 
  Flag, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Download,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Award,
  FileCheck
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function VisaCaseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [visaCase, setVisaCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVisaCase = async () => {
      try {
        const response = await fetch(`/api/visa-cases/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setVisaCase(data);
        } else {
          setError('Failed to fetch visa case');
        }
      } catch (err) {
        setError('Error fetching visa case');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisaCase();
  }, [params.id]);

  const handleDeleteCase = async () => {
    if (confirm('Are you sure you want to delete this visa case?')) {
      try {
        const response = await fetch(`/api/visa-cases/${params.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Visa case deleted successfully');
          router.push('/visa-cases');
        } else {
          alert('Failed to delete visa case');
        }
      } catch (error) {
        console.error('Error deleting visa case:', error);
        alert('Error deleting visa case');
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Visa Case Details" 
          description="Loading visa case information..."
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Visa Case Details" 
          description="Error loading visa case information"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <Link href="/visa-cases" className="text-blue-600 hover:underline mt-2 inline-block">
              Back to Visa Cases
            </Link>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (!visaCase) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Visa Case Details" 
          description="Visa case not found"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">Visa case not found.</p>
            <Link href="/visa-cases" className="text-blue-600 hover:underline mt-2 inline-block">
              Back to Visa Cases
            </Link>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in-process':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusIcon = (uploaded: boolean) => {
    return uploaded ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-yellow-500" />
    );
  };

  const getChecklistStatusIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <Clock className="h-5 w-5 text-gray-400" />
    );
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={`Case: ${visaCase.caseId}`} 
        description={`Details for ${visaCase.clientName}'s ${visaCase.visaType} visa application`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/visa-cases"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cases
              </Link>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/visa-cases/${params.id}/edit`}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Case</span>
              </Link>
              <button
                onClick={handleDeleteCase}
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Case</span>
              </button>
            </div>
          </div>

          {/* Case Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Case ID
                </div>
                <div className="font-semibold">{visaCase.caseId}</div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Flag className="h-4 w-4 mr-2" />
                  Status
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visaCase.status)}`}>
                  {visaCase.status}
                </span>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Award className="h-4 w-4 mr-2" />
                  Priority
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(visaCase.priority)}`}>
                  {visaCase.priority}
                </span>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Applied
                </div>
                <div>{new Date(visaCase.applicationDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Client Info, Assignment, Dates */}
            <div className="space-y-6">
              {/* Client Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">Client Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">{visaCase.clientName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{visaCase.clientEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">N/A</div>
                  </div>
                </div>
              </div>



              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold">Timeline</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Application Date</div>
                    <div className="font-medium">{new Date(visaCase.applicationDate).toLocaleDateString()}</div>
                  </div>
                  {visaCase.submissionDate && (
                    <div>
                      <div className="text-sm text-gray-500">Submission Date</div>
                      <div className="font-medium">{new Date(visaCase.submissionDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {visaCase.decisionDate && (
                    <div>
                      <div className="text-sm text-gray-500">Decision Date</div>
                      <div className="font-medium">{new Date(visaCase.decisionDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {visaCase.expectedDecisionDate && (
                    <div>
                      <div className="text-sm text-gray-500">Expected Decision</div>
                      <div className="font-medium">{new Date(visaCase.expectedDecisionDate).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Visa Details, Documents, Checklist */}
            <div className="lg:col-span-2 space-y-6">
              {/* Visa Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold">Visa Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Visa Type</div>
                    <div className="font-medium capitalize">{visaCase.visaType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Country</div>
                    <div className="font-medium">{visaCase.country}</div>
                  </div>
                </div>
                
                {visaCase.notes && visaCase.notes.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-2">Notes</div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {visaCase.notes.map((note: string, index: number) => (
                        <div key={index} className="text-sm">{note}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold">Required Documents</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {visaCase.documents?.filter((doc: any) => doc.uploaded).length || 0} of {visaCase.documents?.length || 0} uploaded
                  </span>
                </div>
                
                {visaCase.documents && visaCase.documents.length > 0 ? (
                  <div className="space-y-3">
                    {visaCase.documents.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          {getDocumentStatusIcon(doc.uploaded)}
                          <span className="ml-3 font-medium">{doc.name}</span>
                          <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded-full">
                            {doc.type}
                          </span>
                        </div>
                        <div>
                          {doc.uploaded ? (
                            <span className="text-green-600 text-sm">Uploaded</span>
                          ) : (
                            <span className="text-yellow-600 text-sm">Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No documents required for this visa type.</p>
                )}
              </div>

              {/* Checklist */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold">Checklist</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {visaCase.checklistItems?.filter((item: any) => item.completed).length || 0} of {visaCase.checklistItems?.length || 0} completed
                  </span>
                </div>
                
                {visaCase.checklistItems && visaCase.checklistItems.length > 0 ? (
                  <div className="space-y-3">
                    {visaCase.checklistItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          {getChecklistStatusIcon(item.completed)}
                          <span className="ml-3 font-medium">{item.item}</span>
                          <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <div>
                          {item.completed ? (
                            <span className="text-green-600 text-sm">Completed</span>
                          ) : (
                            <span className="text-gray-600 text-sm">Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No checklist items for this visa type.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}