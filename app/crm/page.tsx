'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Target
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

export default function CrmPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'leads'>('leads');
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      await fetchLeads();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
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

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      String(lead.name || '').toLowerCase().includes(term) ||
      String(lead.email || '').toLowerCase().includes(term) ||
      String(lead.phone || '').toLowerCase().includes(term) ||
      String(lead.countryInterest || '').toLowerCase().includes(term) ||
      String(lead.visaType || '').toLowerCase().includes(term)
    );
  });
  

  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showViewLeadModal, setShowViewLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'website',
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
          assignedTo: 'unassigned',
          lastContact: new Date().toISOString().split('T')[0],
          nextFollowUp: '',
          leadScore: 50,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setShowNewLeadModal(false);
        setNewLead({
          name: '',
          email: '',
          phone: '',
          source: 'website',
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

  const handleConvertToClient = async (lead: any) => {
    if (lead?.status === 'converted') {
      alert('This lead has already been converted.');
      return;
    }
    const leadId = lead?._id || lead?.id;
    if (!leadId) {
      alert('Lead ID is missing. Please refresh and try again.');
      return;
    }

    const params = new URLSearchParams();
    params.set('leadId', leadId);
    if (lead?.name) params.set('name', lead.name);
    if (lead?.email) params.set('email', lead.email);
    if (lead?.phone) params.set('phone', lead.phone);
    if (lead?.visaType) params.set('visaType', lead.visaType);
    if (lead?.countryInterest) params.set('countryInterest', lead.countryInterest);

    router.push(`/clients/new?${params.toString()}`);
  };
  
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/crm/leads?id=${leadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Refresh the data
        fetchLeads();
        alert('Lead deleted successfully');
      } else {
        alert('Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('An error occurred while deleting the lead');
    }
  };

  const handleViewLead = (lead: any) => {
    setSelectedLead(lead);
    setShowViewLeadModal(true);
  };

  const handleEditLead = (lead: any) => {
    setSelectedLead(lead);
    // Populate the edit form with existing data
    setNewLead({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'website',
      countryInterest: lead.countryInterest || '',
      visaType: lead.visaType || '',
      notes: lead.notes || ''
    });
    setShowEditLeadModal(true);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/crm/leads?id=${selectedLead._id || selectedLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      });
      
      if (response.ok) {
        const result = await response.json();
        setShowEditLeadModal(false);
        setSelectedLead(null);
        // Reset form
        setNewLead({
          name: '',
          email: '',
          phone: '',
          source: 'website',
          countryInterest: '',
          visaType: '',
          notes: ''
        });
        // Refresh the data
        fetchLeads();
        alert('Lead updated successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update lead');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('An error occurred while updating the lead');
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="CRM & Lead Management" 
        description="Manage leads and prospects"
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {filteredLeads.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                      <p className="mt-1 text-sm text-gray-700">
                        {searchTerm ? 'Try a different search term.' : 'Get started by adding a new lead.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredLeads.map((lead) => (
                        <div key={lead._id || lead.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                              <p className="text-gray-600">{lead.email}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                              lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                              lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                              lead.status === 'lost' ? 'bg-red-100 text-red-800' :
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
                              Interested in {lead.countryInterest || 'N/A'} {lead.visaType || ''}
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
                              onClick={() => handleConvertToClient(lead)}
                              className={`flex-1 text-xs px-3 py-1 rounded transition-colors ${
                                lead.status === 'converted'
                                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                              disabled={lead.status === 'converted'}
                            >
                              {lead.status === 'converted' ? 'Converted' : 'Convert to Client'}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLead(lead);
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="View Lead Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLead(lead);
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Edit Lead"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(lead._id || lead.id);
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
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
                        <option value="website">Website</option>
                        <option value="social_media">Social Media</option>
                        <option value="referral">Referral</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="other">Other</option>
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

        {/* View Lead Modal */}
        {showViewLeadModal && selectedLead && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
                  <button 
                    onClick={() => {
                      setShowViewLeadModal(false);
                      setSelectedLead(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{selectedLead.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedLead.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedLead.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <p className="text-gray-900 capitalize">{selectedLead.source}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country Interest</label>
                    <p className="text-gray-900">{selectedLead.countryInterest || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                    <p className="text-gray-900">{selectedLead.visaType || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedLead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      selectedLead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      selectedLead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                      selectedLead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Score</label>
                    <p className="text-gray-900">{selectedLead.leadScore || 'N/A'}/100</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <p className="text-gray-900">{selectedLead.notes || 'No notes available'}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowViewLeadModal(false);
                      setSelectedLead(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Lead Modal */}
        {showEditLeadModal && selectedLead && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Lead</h3>
                  <button 
                    onClick={() => {
                      setShowEditLeadModal(false);
                      setSelectedLead(null);
                      // Reset form
                      setNewLead({
                        name: '',
                        email: '',
                        phone: '',
                        source: 'website',
                        countryInterest: '',
                        visaType: '',
                        notes: ''
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleUpdateLead}>
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
                        <option value="website">Website</option>
                        <option value="social_media">Social Media</option>
                        <option value="referral">Referral</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="other">Other</option>
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
                      onClick={() => {
                        setShowEditLeadModal(false);
                        setSelectedLead(null);
                        // Reset form
                        setNewLead({
                          name: '',
                          email: '',
                          phone: '',
                          source: 'website',
                          countryInterest: '',
                          visaType: '',
                          notes: ''
                        });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Update Lead
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
