'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Star,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

export default function CrmPage() {
  const [activeTab, setActiveTab] = useState<'leads' | 'followups' | 'history' | 'conversion'>('leads');
  const [leads, setLeads] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [interactionHistory, setInteractionHistory] = useState<any[]>([]);
  
  useEffect(() => {
    fetchLeads();
    fetchFollowUps();
    fetchInteractions();
  }, []);
  
  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/crm/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };
  
  const fetchFollowUps = async () => {
    try {
      const response = await fetch('/api/crm/followups');
      if (response.ok) {
        const data = await response.json();
        setFollowUps(data);
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }
  };
  
  const fetchInteractions = async () => {
    try {
      const response = await fetch('/api/crm/interactions');
      if (response.ok) {
        const data = await response.json();
        setInteractionHistory(data);
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    countryInterest: '',
    visaType: '',
    notes: ''
  });

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLead,
          status: 'new',
          priority: 'medium',
          assignedTo: 'Unassigned',
          lastContact: new Date().toISOString().split('T')[0],
          nextFollowUp: '',
          leadScore: 50,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setLeads([...leads, result.lead]);
        setShowNewLeadModal(false);
        setNewLead({
          name: '',
          email: '',
          phone: '',
          source: 'Website',
          countryInterest: '',
          visaType: '',
          notes: ''
        });
        // Refresh the data
        fetchLeads();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add lead');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('An error occurred while adding the lead');
    }
  };

  const handleConvertToClient = async (leadId: string) => {
    try {
      // In a real application, this would convert the lead to a client
      // For now, we'll update the lead status to 'converted'
      const response = await fetch(`/api/crm/leads?id=${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'converted' }),
      });
      
      if (response.ok) {
        // Refresh the data
        fetchLeads();
        alert(`Lead ${leadId} has been converted to a client and moved to the client management system.`);
      } else {
        alert('Failed to convert lead to client');
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('An error occurred while converting the lead');
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="CRM & Lead Management" 
        description="Manage leads, track interactions, and convert prospects to clients"
      >
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'leads'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('leads')}
            >
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Leads
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'followups'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('followups')}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Follow-ups
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Interaction History
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'conversion'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('conversion')}
            >
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Conversion Flows
              </div>
            </button>
          </div>

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search leads..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowNewLeadModal(true)}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Lead</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                        <p className="text-gray-600">{lead.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {lead.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        Interested in {lead.countryInterest} {lead.visaType}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 mr-2" />
                        Lead Score: {lead.leadScore}/100
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Next follow-up: {lead.nextFollowUp || 'Not scheduled'}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                      <button 
                        onClick={() => handleConvertToClient(lead.id)}
                        className="flex-1 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        Convert to Client
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-ups Tab */}
          {activeTab === 'followups' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Scheduled Follow-ups</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {followUps.map((followUp) => (
                        <tr key={followUp.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{followUp.leadName}</div>
                            <div className="text-sm text-gray-500">{followUp.leadId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{followUp.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {followUp.scheduledDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              followUp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {followUp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            {followUp.notes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Mark Complete</button>
                            <button className="text-red-600 hover:text-red-900">Reschedule</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Interaction History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Interaction History</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {interactionHistory.map((interaction) => (
                    <div key={interaction.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-gray-900">{interaction.leadName}</h4>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {interaction.type}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{interaction.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{interaction.date}</p>
                          <p className="text-sm text-gray-500">by {interaction.agent}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Outcome: {interaction.outcome}</span>
                        {interaction.duration && <span className="ml-4">Duration: {interaction.duration}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversion Flows Tab */}
          {activeTab === 'conversion' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Lead Capture</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Configure sources for capturing leads from website and social media</p>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Website Forms</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Contact forms with visa inquiry options</li>
                        <li>• Free consultation booking</li>
                        <li>• Newsletter signup with lead magnet</li>
                      </ul>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Social Media Integration</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Facebook lead ads integration</li>
                        <li>• LinkedIn form fills</li>
                        <li>• Instagram contact forms</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Conversion Process</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Steps to convert leads to clients</p>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Qualification Criteria</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Budget assessment</li>
                        <li>• Timeline confirmation</li>
                        <li>• Document readiness</li>
                      </ul>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Conversion Steps</h4>
                      <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                        <li>Initial consultation</li>
                        <li>Service proposal</li>
                        <li>Contract signing</li>
                        <li>Client onboarding</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Download className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Import Leads</h3>
                </div>
                <p className="text-gray-600 mb-4">Bulk import leads from CSV or Excel file</p>
                
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="lead-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV file (MAX. 10MB)</p>
                    </div>
                    <input 
                      id="lead-upload" 
                      type="file" 
                      className="hidden" 
                      accept=".csv" 
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Lead Modal */}
        {showNewLeadModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Lead</h3>
                  <button 
                    onClick={() => setShowNewLeadModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddLead}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={newLead.name}
                        onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={newLead.email}
                        onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                      <select
                        value={newLead.source}
                        onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Website">Website</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Referral">Referral</option>
                        <option value="Advertisement">Advertisement</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country Interest</label>
                      <input
                        type="text"
                        value={newLead.countryInterest}
                        onChange={(e) => setNewLead({...newLead, countryInterest: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Country of interest"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                      <input
                        type="text"
                        value={newLead.visaType}
                        onChange={(e) => setNewLead({...newLead, visaType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Visa type interested in"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={newLead.notes}
                        onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewLeadModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Add Lead
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
}