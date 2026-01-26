'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/app/protected-route';
import SidebarLayout from '@/app/components/sidebar-layout';
import { 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Edit, 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Upload,
  History,
  Eye,
  MessageSquare,
  Trash2,
  Save
} from 'lucide-react';

interface CaseApproval {
  id: string;
  caseId: string;
  applicantName: string;
  visaType: string;
  country: string;
  status: 'pending' | 'approved' | 'rejected' | 'locked' | 'submitted';
  submittedDate?: string;
  lockedDate?: string;
  supervisorReview?: string;
  versionHistory: VersionEntry[];
  approvalSteps: ApprovalStep[];
  applicantData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    travelDates: {
      departure: string;
      return: string;
    };
  };
  documents: DocumentInfo[];
}

interface VersionEntry {
  id: string;
  date: string;
  user: string;
  changes: string[];
  documentChanges: string[];
}

interface ApprovalStep {
  id: string;
  step: number;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedDate?: string;
  notes?: string;
}

interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'needs-correction';
}

const CaseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [caseData, setCaseData] = useState<CaseApproval | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real implementation, we would fetch the specific case data from the API
        // For now, simulating API call
        const response = await fetch(`/api/visa-cases/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch case data');
        }
        const data = await response.json();
        setCaseData(data);
      } catch (error) {
        console.error('Error fetching case data:', error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleBack = () => {
    router.push('/case-control');
  };

  const handleLockCase = async () => {
    try {
      const response = await fetch('/api/case-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lock', caseId: caseData?.id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to lock case');
      }
      
      // Refresh the data
      const data = await response.json();
      alert(`Case ${caseData?.id} has been locked. No further edits allowed.`);
      // In a real implementation, we would update the UI with the new data
    } catch (error) {
      console.error('Error locking case:', error);
      alert('Error locking case. Please try again.');
    }
  };

  const handleUnlockCase = async () => {
    try {
      const response = await fetch('/api/case-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlock', caseId: caseData?.id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to unlock case');
      }
      
      // Refresh the data
      const data = await response.json();
      alert(`Case ${caseData?.id} has been unlocked. Edits are now allowed.`);
      // In a real implementation, we would update the UI with the new data
    } catch (error) {
      console.error('Error unlocking case:', error);
      alert('Error unlocking case. Please try again.');
    }
  };

  const handleApproveStep = async (stepId: string) => {
    try {
      const response = await fetch('/api/case-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve-step', caseId: caseData?.id, stepId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve step');
      }
      
      // Refresh the data
      const data = await response.json();
      alert(`Step ${stepId} approved.`);
      // In a real implementation, we would update the UI with the new data
    } catch (error) {
      console.error('Error approving step:', error);
      alert('Error approving step. Please try again.');
    }
  };

  const handleRequestCorrection = async (stepId: string) => {
    try {
      const response = await fetch('/api/case-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-correction', caseId: caseData?.id, stepId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to request correction');
      }
      
      // Refresh the data
      const data = await response.json();
      alert(`Correction requested for step ${stepId}.`);
      // In a real implementation, we would update the UI with the new data
    } catch (error) {
      console.error('Error requesting correction:', error);
      alert('Error requesting correction. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'locked': return 'bg-purple-100 text-purple-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'locked': return <Lock className="h-4 w-4" />;
      case 'submitted': return <FileText className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Case Control & Quality Assurance" description="Loading case details...">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (!caseData) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Case Control & Quality Assurance" description="Case not found">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Case not found</h3>
              <p className="mt-1 text-sm text-gray-500">The requested case could not be found.</p>
              <button
                onClick={handleBack}
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cases
              </button>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={`Case: ${caseData.id}`} 
        description={`${caseData.applicantName} - ${caseData.visaType} Visa Application`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cases
              </button>
            </div>
            <div className="flex space-x-3">
              {caseData.status !== 'locked' ? (
                <button
                  onClick={handleLockCase}
                  className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  <span>Lock Case</span>
                </button>
              ) : (
                <button
                  onClick={handleUnlockCase}
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Unlock Case</span>
                </button>
              )}
            </div>
          </div>

          {/* Case Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Case ID
                </div>
                <div className="font-semibold">{caseData.id}</div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Users className="h-4 w-4 mr-2" />
                  Applicant
                </div>
                <div className="font-semibold">{caseData.applicantName}</div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Visa Type
                </div>
                <div className="font-semibold">{caseData.visaType}</div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Country
                </div>
                <div className="font-semibold">{caseData.country}</div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Status
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}>
                  {getStatusIcon(caseData.status)}
                  <span className="ml-1 capitalize">{caseData.status}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Case Details
              </button>
              <button
                onClick={() => setActiveTab('approval')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approval'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Approval Process
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'versions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Version History
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documents
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Applicant Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">Applicant Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">First Name</div>
                      <div className="font-medium">{caseData.applicantData.firstName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Last Name</div>
                      <div className="font-medium">{caseData.applicantData.lastName}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{caseData.applicantData.email}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{caseData.applicantData.phone}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Date of Birth</div>
                      <div className="font-medium">{caseData.applicantData.dateOfBirth}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Nationality</div>
                      <div className="font-medium">{caseData.applicantData.nationality}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Passport Number</div>
                    <div className="font-medium">{caseData.applicantData.passportNumber}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Departure Date</div>
                      <div className="font-medium">{caseData.applicantData.travelDates.departure}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Return Date</div>
                      <div className="font-medium">{caseData.applicantData.travelDates.return}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Status */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold">Case Status</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Current Status</div>
                    <div className="font-medium capitalize">{caseData.status}</div>
                  </div>
                  
                  {caseData.supervisorReview && (
                    <div>
                      <div className="text-sm text-gray-500">Supervisor Review</div>
                      <div className="font-medium">{caseData.supervisorReview}</div>
                    </div>
                  )}
                  
                  {caseData.lockedDate && (
                    <div>
                      <div className="text-sm text-gray-500">Locked Date</div>
                      <div className="font-medium">{caseData.lockedDate}</div>
                    </div>
                  )}
                  
                  {caseData.submittedDate && (
                    <div>
                      <div className="text-sm text-gray-500">Submitted Date</div>
                      <div className="font-medium">{caseData.submittedDate}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-gray-500">Approval Progress</div>
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.round((caseData.approvalSteps.filter(s => s.completed).length / caseData.approvalSteps.length) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {caseData.approvalSteps.filter(s => s.completed).length}/{caseData.approvalSteps.length} completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approval' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold">Approval Process</h3>
              </div>
              
              <div className="space-y-6">
                {caseData.approvalSteps.map((step, index) => (
                  <div key={step.id} className="border-l-4 border-gray-200 pl-4 py-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-800 mr-3">
                            {index + 1}
                          </span>
                          <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                        </div>
                        {step.notes && (
                          <p className="mt-1 text-sm text-gray-500">{step.notes}</p>
                        )}
                        {step.completedBy && step.completedDate && (
                          <p className="mt-1 text-xs text-gray-500">
                            Completed by {step.completedBy} on {step.completedDate}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {step.completed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveStep(step.id)}
                              className="inline-flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRequestCorrection(step.id)}
                              className="inline-flex items-center space-x-1 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Request Correction</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center mb-4">
                <History className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold">Version History</h3>
              </div>
              
              <div className="space-y-6">
                {caseData.versionHistory.map((version) => (
                  <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <History className="h-4 w-4 text-gray-500 mr-2" />
                          <h4 className="text-sm font-medium text-gray-900">Version {version.id}</h4>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          By {version.user} on {version.date}
                        </p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="mt-3">
                      {version.changes.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Data Changes</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {version.changes.map((change, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {version.documentChanges.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Document Changes</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {version.documentChanges.map((change, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">Documents</h3>
                </div>
                <button className="inline-flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {caseData.documents.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.uploadedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.uploadDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {doc.status === 'verified' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                             doc.status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> :
                             <AlertCircle className="h-3 w-3 mr-1" />}
                            <span className="capitalize">{doc.status.replace('-', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-900">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
};

export default CaseDetailPage;