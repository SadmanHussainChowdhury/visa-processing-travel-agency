'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  Users,
  Search,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function NewNotificationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'compose' | 'recipients' | 'preview'>('compose');

  const [formData, setFormData] = useState({
    type: 'email',
    subject: '',
    content: '',
    recipients: [] as { id: string; name: string; email?: string; phone?: string }[],
    priority: 'medium',
    sendTime: 'immediate',
    templateId: ''
  });

  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (response.ok) {
          const data = await response.json();
          // Transform client data to match expected format
          const clientList = data.map((client: any) => ({
            id: client._id || client.id,
            name: `${client.firstName} ${client.lastName}`,
            email: client.email,
            phone: client.phone
          }));
          setClients(clientList);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    
    fetchClients();
  }, []);

  const notificationTypes = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'both', label: 'Email & SMS' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const sendTimes = [
    { value: 'immediate', label: 'Send Immediately' },
    { value: 'scheduled', label: 'Schedule for Later' }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addRecipient = (client: { id: string; name: string; email?: string; phone?: string }) => {
    if (!formData.recipients.some(r => r.id === client.id)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, client]
      }));
    }
  };

  const removeRecipient = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.id !== clientId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Notification type is required';
    }

    if (formData.type === 'email' && !formData.subject.trim()) {
      newErrors.subject = 'Subject is required for emails';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.recipients.length === 0) {
      newErrors.recipients = 'At least one recipient is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to send notification
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recipients: formData.recipients.map(r => ({
            id: r.id,
            name: r.name,
            contact: formData.type === 'email' ? r.email : r.phone
          }))
        }),
      });

      if (response.ok) {
        alert('Notification sent successfully!');
        router.push('/notifications');
      } else {
        const errorData = await response.json();
        console.error('Error sending notification:', errorData);
        alert('Failed to send notification: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Network error occurred while sending notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/notifications');
  };

  const nextTab = () => {
    const tabs = ['compose', 'recipients', 'preview'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1] as any);
    }
  };

  const prevTab = () => {
    const tabs = ['compose', 'recipients', 'preview'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1] as any);
    }
  };

  const isTabValid = (tab: string) => {
    switch (tab) {
      case 'compose':
        return formData.type && formData.content && (!formData.type.includes('email') || formData.subject);
      case 'recipients':
        return formData.recipients.length > 0;
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Send New Notification" 
        description="Create and send email/SMS notifications to clients"
      >
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notifications
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { id: 'compose', label: 'Compose', icon: Mail },
                { id: 'recipients', label: 'Recipients', icon: Users },
                { id: 'preview', label: 'Preview', icon: CheckCircle }
              ].map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    activeTab === step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isTabValid(step.id)
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      activeTab === step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isTabValid(step.id) ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'compose', label: 'Compose Message', icon: Mail },
                { id: 'recipients', label: 'Select Recipients', icon: Users },
                { id: 'preview', label: 'Preview & Send', icon: CheckCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Compose Message Tab */}
              {activeTab === 'compose' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Mail className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Type *
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.type ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {notificationTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.type}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      {formData.type.includes('email') && (
                        <>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                            Subject *
                          </label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.subject ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter email subject"
                          />
                          {errors.subject && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.subject}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows={6}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.content ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your message content here..."
                      ></textarea>
                      {errors.content && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.content}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="sendTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Send Time
                      </label>
                      <select
                        id="sendTime"
                        name="sendTime"
                        value={formData.sendTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {sendTimes.map(time => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Select Recipients Tab */}
              {activeTab === 'recipients' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Users className="w-6 h-6 text-green-600 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-900">Select Recipients</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Client Selection Panel */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredClients.map(client => (
                          <div 
                            key={client.id} 
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                              formData.recipients.some(r => r.id === client.id) 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200'
                            }`}
                            onClick={() => addRecipient(client)}
                          >
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-gray-600">
                                {client.email || client.phone}
                              </div>
                            </div>
                            {formData.recipients.some(r => r.id === client.id) && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Recipients Panel */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Selected Recipients ({formData.recipients.length})</h3>
                      
                      {formData.recipients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                          <p>No recipients selected</p>
                          <p className="text-sm">Select clients from the list</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {formData.recipients.map(recipient => (
                            <div 
                              key={recipient.id} 
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                            >
                              <div>
                                <div className="font-medium">{recipient.name}</div>
                                <div className="text-sm text-gray-600">
                                  {recipient.email || recipient.phone}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeRecipient(recipient.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {errors.recipients && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.recipients}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="w-6 h-6 text-purple-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Preview & Send</h2>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formData.subject || 'Notification Message'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          formData.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : formData.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Type: {formData.type}</span>
                        <span className="mx-2">•</span>
                        <span>Sending to {formData.recipients.length} recipient{formData.recipients.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                      <div className="prose max-w-none">
                        <p>{formData.content}</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <Bell className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900">Sending Details</h4>
                          <ul className="mt-1 text-sm text-blue-800 space-y-1">
                            <li>• Type: {formData.type === 'both' ? 'Email & SMS' : formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}</li>
                            <li>• Recipients: {formData.recipients.length} client{formData.recipients.length !== 1 ? 's' : ''}</li>
                            <li>• Priority: {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}</li>
                            <li>• Send time: {sendTimes.find(s => s.value === formData.sendTime)?.label}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <div>
                {activeTab !== 'compose' && (
                  <button
                    type="button"
                    onClick={prevTab}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                
                {activeTab !== 'preview' ? (
                  <button
                    type="button"
                    onClick={nextTab}
                    disabled={!isTabValid(activeTab)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Notification
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}