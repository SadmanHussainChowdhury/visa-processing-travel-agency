'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProtectedRoute } from '@/components/protected-route';
import SidebarLayout from '@/app/components/sidebar-layout';
import { 
  Lock, 
  Eye, 
  Edit, 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Upload,
  History,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

interface CaseApproval {
  id: string;
  caseId: string;
  applicantName: string;
  visaType: string;
  status: 'pending' | 'approved' | 'rejected' | 'locked' | 'submitted';
  submittedDate?: string;
  lockedDate?: string;
  supervisorReview?: string;
  versionHistory: VersionEntry[];
  approvalSteps: ApprovalStep[];
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

const CaseControlPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [cases, setCases] = useState<CaseApproval[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showLockedCases, setShowLockedCases] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockCases: CaseApproval[] = [
        {
          id: 'CCQA-001',
          caseId: 'VC-001',
          applicantName: 'John Smith',
          visaType: 'Tourist',
          status: 'pending',
          versionHistory: [
            {
              id: 'vh-1',
              date: '2024-01-15',
              user: 'Alice Johnson',
              changes: ['Updated personal information', 'Added supporting documents'],
              documentChanges: ['Passport.pdf added', 'Financial proof.pdf updated']
            },
            {
              id: 'vh-2',
              date: '2024-01-16',
              user: 'Bob Williams',
              changes: ['Corrected birth date', 'Updated travel dates'],
              documentChanges: []
            }
          ],
          approvalSteps: [
            { id: 'as-1', step: 1, title: 'Initial Review', completed: true, completedBy: 'Alice Johnson', completedDate: '2024-01-15' },
            { id: 'as-2', step: 2, title: 'Document Verification', completed: true, completedBy: 'Bob Williams', completedDate: '2024-01-16' },
            { id: 'as-3', step: 3, title: 'Supervisor Approval', completed: false, title: 'Supervisor Approval' },
            { id: 'as-4', step: 4, title: 'Final Check', completed: false, title: 'Final Check' }
          ]
        },
        {
          id: 'CCQA-002',
          caseId: 'VC-002',
          applicantName: 'Maria Garcia',
          visaType: 'Student',
          status: 'approved',
          submittedDate: '2024-01-14',
          versionHistory: [
            {
              id: 'vh-1',
              date: '2024-01-12',
              user: 'Charlie Brown',
              changes: ['Created initial application'],
              documentChanges: ['Application form.pdf added']
            }
          ],
          approvalSteps: [
            { id: 'as-1', step: 1, title: 'Initial Review', completed: true, completedBy: 'Charlie Brown', completedDate: '2024-01-12' },
            { id: 'as-2', step: 2, title: 'Document Verification', completed: true, completedBy: 'Diana Prince', completedDate: '2024-01-13' },
            { id: 'as-3', step: 3, title: 'Supervisor Approval', completed: true, completedBy: 'Eve Wilson', completedDate: '2024-01-14' },
            { id: 'as-4', step: 4, title: 'Final Check', completed: true, completedBy: 'Frank Miller', completedDate: '2024-01-14' }
          ]
        },
        {
          id: 'CCQA-003',
          caseId: 'VC-003',
          applicantName: 'Ahmed Hassan',
          visaType: 'Business',
          status: 'locked',
          lockedDate: '2024-01-13',
          supervisorReview: 'Requires additional documentation before proceeding',
          versionHistory: [
            {
              id: 'vh-1',
              date: '2024-01-10',
              user: 'Grace Lee',
              changes: ['Submitted initial application'],
              documentChanges: ['Application form.pdf added', 'Business invitation letter.pdf added']
            }
          ],
          approvalSteps: [
            { id: 'as-1', step: 1, title: 'Initial Review', completed: true, completedBy: 'Grace Lee', completedDate: '2024-01-10' },
            { id: 'as-2', step: 2, title: 'Document Verification', completed: true, completedBy: 'Henry Davis', completedDate: '2024-01-11' },
            { id: 'as-3', step: 3, title: 'Supervisor Approval', completed: false, title: 'Supervisor Approval', notes: 'Requires additional documentation' },
            { id: 'as-4', step: 4, title: 'Final Check', completed: false, title: 'Final Check' }
          ]
        },
        {
          id: 'CCQA-004',
          caseId: 'VC-004',
          applicantName: 'Sarah Johnson',
          visaType: 'Work',
          status: 'submitted',
          submittedDate: '2024-01-16',
          versionHistory: [
            {
              id: 'vh-1',
              date: '2024-01-14',
              user: 'Ivan Petrov',
              changes: ['Completed application'],
              documentChanges: ['Application form.pdf added', 'Employment letter.pdf added']
            }
          ],
          approvalSteps: [
            { id: 'as-1', step: 1, title: 'Initial Review', completed: true, completedBy: 'Ivan Petrov', completedDate: '2024-01-14' },
            { id: 'as-2', step: 2, title: 'Document Verification', completed: true, completedBy: 'Julia Chen', completedDate: '2024-01-15' },
            { id: 'as-3', step: 3, title: 'Supervisor Approval', completed: true, completedBy: 'Kevin Liu', completedDate: '2024-01-16' },
            { id: 'as-4', step: 4, title: 'Final Check', completed: true, completedBy: 'Laura Martin', completedDate: '2024-01-16' }
          ]
        }
      ];
      setCases(mockCases);
      setFilteredCases(mockCases);
      setLoading(false);
    }, 800);
  }, []);

  // Filter cases based on search term and status
  useEffect(() => {
    let result = cases;

    if (searchTerm) {
      result = result.filter(c => 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.visaType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (!showLockedCases) {
      result = result.filter(c => c.status !== 'locked');
    }

    setFilteredCases(result);
  }, [searchTerm, statusFilter, showLockedCases, cases]);

  const handleViewDetails = (caseId: string) => {
    router.push(`/case-control/${caseId}`);
  };

  const handleLockCase = (caseId: string) => {
    alert(`Case ${caseId} has been locked. No further edits allowed.`);
    // In a real implementation, this would call an API to lock the case
  };

  const handleUnlockCase = (caseId: string) => {
    alert(`Case ${caseId} has been unlocked. Edits are now allowed.`);
    // In a real implementation, this would call an API to unlock the case
  };

  const handleRequestCorrection = (caseId: string) => {
    alert(`Correction requested for case ${caseId}. Supervisor will be notified.`);
    // In a real implementation, this would call an API to request corrections
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
        <SidebarLayout title="Case Control & Quality Assurance" description="Loading cases...">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Case Control & Quality Assurance" 
        description="Monitor and manage case approvals, quality assurance, and version history"
      >
        <div className="max-w-7xl mx-auto">
          {/* Filters and Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Cases
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by ID, name, or visa type..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="locked">Locked</option>
                  <option value="submitted">Submitted</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={showLockedCases}
                    onChange={(e) => setShowLockedCases(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Locked Cases</span>
                </label>
              </div>
              
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visa Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{c.id}</div>
                        <div className="text-sm text-gray-500">{c.caseId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{c.applicantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {c.visaType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                          {getStatusIcon(c.status)}
                          <span className="ml-1 capitalize">{c.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.round((c.approvalSteps.filter(s => s.completed).length / c.approvalSteps.length) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-600">
                            {c.approvalSteps.filter(s => s.completed).length}/{c.approvalSteps.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(c.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          
                          {c.status !== 'locked' && (
                            <button
                              onClick={() => handleLockCase(c.id)}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Lock
                            </button>
                          )}
                          
                          {c.status === 'locked' && (
                            <button
                              onClick={() => handleUnlockCase(c.id)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Unlock
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleRequestCorrection(c.id)}
                            className="text-yellow-600 hover:text-yellow-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Request Correction
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredCases.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{cases.length}</h3>
                  <p className="text-sm text-gray-500">Total Cases</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'pending').length}</h3>
                  <p className="text-sm text-gray-500">Pending Approval</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'locked').length}</h3>
                  <p className="text-sm text-gray-500">Locked Cases</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'approved' || c.status === 'submitted').length}</h3>
                  <p className="text-sm text-gray-500">Approved/Submitted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
};

export default CaseControlPage;