'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Calendar,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Bell
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function DocumentAlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/document-alerts');
        if (response.ok) {
          const data = await response.json();
          // Map _id to id for consistency in the component
          const mappedData = data.map((alert: any) => ({
            ...alert,
            id: alert._id,
            clientName: alert.clientId?.name || alert.clientName || 'Unknown Client'
          }));
          setAlerts(mappedData);
        } else {
          console.error('Failed to fetch alerts');
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);

  const generateAlertsFromDocuments = async () => {
    try {
      const response = await fetch('/api/document-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generate-from-documents' }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Successfully generated ${result.count} alerts from document management data!`);
        // Refresh the alerts
        const refreshResponse = await fetch('/api/document-alerts');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAlerts(data);
        }
      } else {
        const error = await response.json();
        alert(`Failed to generate alerts: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
      alert('Error occurred while generating alerts');
    }
  };

  const alertTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'missing', label: 'Missing' },
    { value: 'expiring', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' }
  ];

  const alertStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' }
  ];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || alert.alertType === selectedType;
    const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'missing':
        return <FileText className="h-4 w-4" />;
      case 'expiring':
        return <Calendar className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/document-alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId, status: 'resolved' }),
      });
      
      if (response.ok) {
        const updatedAlert = await response.json();
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, status: 'resolved' } : alert
        ));
        alert('Alert resolved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to resolve alert: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Error occurred while resolving alert');
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/document-alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId, status: 'dismissed' }),
      });
      
      if (response.ok) {
        const updatedAlert = await response.json();
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, status: 'dismissed' } : alert
        ));
        alert('Alert dismissed successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to dismiss alert: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
      alert('Error occurred while dismissing alert');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Document Alerts" description="Loading alerts...">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Document Alerts" 
        description="Monitor document statuses and receive alerts for missing or expiring documents"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'}
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generateAlertsFromDocuments}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span>Generate from Documents</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              >
                {alertTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4"></div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              >
                {alertStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Alert Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(alert.alertType)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{alert.documentType}</div>
                          <div className="text-sm text-gray-500">{alert.documentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{alert.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{alert.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.dueDate ? new Date(alert.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`flex items-center ${getPriorityColor(alert.priority)}`}>
                        {alert.priority === 'high' && <AlertTriangle className="h-4 w-4 mr-1" />}
                        {alert.priority === 'medium' && <Calendar className="h-4 w-4 mr-1" />}
                        {alert.priority === 'low' && <CheckCircle className="h-4 w-4 mr-1" />}
                        {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleResolveAlert(alert._id)}
                          className="text-green-600 hover:text-green-900 hover:underline"
                          title="Resolve Alert"
                          disabled={alert.status !== 'active'}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDismissAlert(alert._id)}
                          className="text-red-600 hover:text-red-900 hover:underline"
                          title="Dismiss Alert"
                          disabled={alert.status !== 'active'}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
            <p className="mt-1 text-sm text-gray-700">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No document alerts at this time.'
              }
            </p>
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
}