'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, MessageSquare, MapPin, CheckCircle, XCircle, AlertTriangle, Filter, Search, Eye, Edit, Trash2, Plus, Download, ExternalLink, Upload } from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

interface CaseTimelineEvent {
  id: string;
  date: string;
  status: 'pending' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'completed';
  title: string;
  description: string;
  embassy?: string;
  notes?: string;
  submittedBy?: string;
}

interface CaseProgress {
  id: string;
  caseId: string;
  clientName: string;
  visaType: string;
  country: string;
  status: 'draft' | 'in-progress' | 'submitted' | 'approved' | 'rejected' | 'completed';
  embassySubmissionDate?: string;
  embassy?: string;
  timeline: CaseTimelineEvent[];
  internalNotes: string[];
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  status: string;
  visaType: string;
  country: string;
  searchQuery: string;
}

export default function WorkflowTrackingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState<CaseProgress[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseProgress | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    visaType: '',
    country: '',
    searchQuery: ''
  });
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    loadCaseData();
  }, []);

  const loadCaseData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow-tracking/cases');
      if (response.ok) {
        const data = await response.json();
        setCases(data);
      } else {
        console.error('Failed to fetch case data:', response.statusText);
        // Still show error to user
        alert('Failed to load case data. Please try again later.');
      }
    } catch (error) {
      console.error('Error loading case data:', error);
      alert('Error loading case data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSelect = async (selectedCase: CaseProgress) => {
    try {
      // Fetch the full case details from the API
      const response = await fetch(`/api/workflow-tracking/cases/${selectedCase.id}`);
      if (response.ok) {
        const fullCase = await response.json();
        setSelectedCase(fullCase);
        setActiveTab('timeline');
      } else {
        console.error('Failed to fetch case details:', response.statusText);
        // Fallback to the selected case
        setSelectedCase(selectedCase);
        setActiveTab('timeline');
      }
    } catch (error) {
      console.error('Error fetching case details:', error);
      // Fallback to the selected case
      setSelectedCase(selectedCase);
      setActiveTab('timeline');
    }
  };

  const handleAddNote = async () => {
    if (!selectedCase || !newNote.trim()) return;

    try {
      const response = await fetch(`/api/workflow-tracking/cases/${selectedCase.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: newNote,
          userId: 'current-user-id' // In a real app, this would come from the authenticated user session
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedCase = {
          ...selectedCase,
          internalNotes: result.notes,
          updatedAt: new Date().toISOString()
        };
        setSelectedCase(updatedCase);
        
        // Update the main cases list
        setCases(prevCases => 
          prevCases.map(c => c.id === selectedCase.id ? updatedCase : c)
        );
        
        setNewNote('');
        setShowAddNote(false);
      } else {
        alert('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  const handleExportCase = () => {
    if (!selectedCase) return;

    // Create a simplified version of the case data for export
    const exportData = {
      caseId: selectedCase.caseId,
      clientName: selectedCase.clientName,
      visaType: selectedCase.visaType,
      country: selectedCase.country,
      status: selectedCase.status,
      embassy: selectedCase.embassy,
      embassySubmissionDate: selectedCase.embassySubmissionDate,
      timeline: selectedCase.timeline,
      internalNotes: selectedCase.internalNotes,
      createdAt: selectedCase.createdAt,
      updatedAt: selectedCase.updatedAt,
      exportDate: new Date().toISOString()
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visa-case-${selectedCase.caseId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCases = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const importedData = JSON.parse(content);
      
      // Handle different import formats
      let casesToImport: any[] = [];
      if (Array.isArray(importedData)) {
        // Direct array of cases
        casesToImport = importedData;
      } else if (importedData.allCases && Array.isArray(importedData.allCases)) {
        // Imported from our export format
        casesToImport = importedData.allCases;
      } else if (importedData.caseId) {
        // Single case
        casesToImport = [importedData];
      }
      
      if (casesToImport.length > 0) {
        // Add the imported cases to our existing cases
        setCases(prev => [...prev, ...casesToImport]);
        alert(`${casesToImport.length} case(s) imported successfully!`);
      } else {
        alert('No valid cases found in the imported file.');
      }
      
      // Reset the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error importing cases:', error);
      alert('Error importing cases. Please check the file format and try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'under-review': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case 'pending': return <AlertTriangle className="h-5 w-5 text-gray-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.status === 'submitted').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Cases</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex justify-end mb-4 space-x-2">
              <label className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportCases}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  // Export all cases
                  const exportData = {
                    allCases: cases,
                    exportDate: new Date().toISOString(),
                    totalCases: cases.length
                  };
                  
                  const jsonString = JSON.stringify(exportData, null, 2);
                  const blob = new Blob([jsonString], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `visa-cases-overview-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Export All
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visa Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Embassy
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {caseItem.caseId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.visaType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.embassy || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.embassySubmissionDate ? new Date(caseItem.embassySubmissionDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCaseSelect(caseItem)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          // Export individual case
                          const exportData = {
                            caseId: caseItem.caseId,
                            clientName: caseItem.clientName,
                            visaType: caseItem.visaType,
                            country: caseItem.country,
                            status: caseItem.status,
                            embassy: caseItem.embassy,
                            embassySubmissionDate: caseItem.embassySubmissionDate,
                            timeline: caseItem.timeline,
                            internalNotes: caseItem.internalNotes,
                            createdAt: caseItem.createdAt,
                            updatedAt: caseItem.updatedAt,
                            exportDate: new Date().toISOString()
                          };
                          
                          const jsonString = JSON.stringify(exportData, null, 2);
                          const blob = new Blob([jsonString], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `visa-case-${caseItem.caseId}-${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderTimeline = () => {
    if (!selectedCase) {
      return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Case Selected</h3>
          <p className="text-gray-500">Select a case from the overview to view its timeline</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedCase.clientName}</h3>
              <p className="text-gray-600">{selectedCase.caseId} • {selectedCase.visaType} Visa to {selectedCase.country}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportCase}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedCase.status)}`}>
                {selectedCase.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Embassy</h4>
              <p className="text-sm text-gray-600">{selectedCase.embassy || 'Not submitted yet'}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Submission Date</h4>
              <p className="text-sm text-gray-600">
                {selectedCase.embassySubmissionDate 
                  ? new Date(selectedCase.embassySubmissionDate).toLocaleDateString() 
                  : 'Not submitted yet'}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
              <p className="text-sm text-gray-600">{new Date(selectedCase.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Timeline</h3>
          
          <div className="space-y-4">
            {selectedCase.timeline.map((event, index) => (
              <div key={event.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="rounded-full bg-white border-2 border-gray-300 p-1">
                    {getTimelineIcon(event.status)}
                  </div>
                  {index < selectedCase.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                  )}
                </div>
                
                <div className="pb-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  {event.embassy && (
                    <p className="text-sm text-blue-600 mt-1">Embassy: {event.embassy}</p>
                  )}
                  {event.submittedBy && (
                    <p className="text-sm text-gray-500 mt-1">By: {event.submittedBy}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Internal Notes</h3>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Add Note
            </button>
          </div>
          
          {showAddNote && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal note..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddNote(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {selectedCase.internalNotes.map((note, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">{note}</p>
                <p className="text-xs text-gray-500 mt-1">Added: {new Date(selectedCase.updatedAt).toLocaleDateString()}</p>
              </div>
            ))}
            
            {selectedCase.internalNotes.length === 0 && (
              <p className="text-sm text-gray-500 italic">No internal notes yet</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Workflow & Tracking" 
        description="Track visa case progress, embassy submissions, and approval history"
      >
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('overview');
                setSelectedCase(null);
              }}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Case Overview
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => selectedCase && setActiveTab('timeline')}
              disabled={!selectedCase}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Case Timeline
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'timeline' && renderTimeline()}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}