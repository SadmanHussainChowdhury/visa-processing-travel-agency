'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Globe, FileText, AlertTriangle, Search, Filter, Download, Star, Clock, User } from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

export default function KnowledgeHelpSystem() {
  const [activeTab, setActiveTab] = useState<'knowledge-base' | 'sop-docs' | 'learning-guidelines' | 'rejection-tips'>('knowledge-base');
  const [searchQuery, setSearchQuery] = useState('');
  const [visaKnowledgeBase, setVisaKnowledgeBase] = useState<any[]>([]);
  const [sopDocuments, setSopDocuments] = useState<any[]>([]);
  const [learningGuidelines, setLearningGuidelines] = useState<any[]>([]);
  const [rejectionTips, setRejectionTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVisaKnowledgeModal, setShowVisaKnowledgeModal] = useState(false);
  const [showSOPModal, setShowSOPModal] = useState(false);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showSOPViewModal, setShowSOPViewModal] = useState(false);
  const [selectedSOPDoc, setSelectedSOPDoc] = useState<any>(null);
  
  // State for form inputs
  const [newVisaKnowledge, setNewVisaKnowledge] = useState({
    country: '',
    visaType: '',
    requirements: [''],
    processingTime: '',
    fees: '',
    difficulty: 'Medium',
    tips: ''
  });
  
  const [newSOPDoc, setNewSOPDoc] = useState({
    title: '',
    type: '',
    country: '',
    version: '1.0',
    content: '',
    author: ''
  });
  
  const [newGuideline, setNewGuideline] = useState({
    title: '',
    category: '',
    duration: '10 min',
    level: 'Beginner',
    completed: false,
    rating: 0,
    enrolled: 0
  });
  
  const [newTip, setNewTip] = useState({
    country: '',
    visaType: '',
    tipCategory: '',
    title: '',
    description: '',
    solution: '',
    example: ''
  });

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/knowledge-help');
      const data = await response.json();
      setVisaKnowledgeBase(data.visaKnowledge);
      setSopDocuments(data.sopDocs);
      setLearningGuidelines(data.learningGuidelines);
      setRejectionTips(data.rejectionTips);
    } catch (error) {
      console.error('Error fetching knowledge help data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to add a new visa knowledge entry
  const addVisaKnowledge = async (entry: any) => {
    try {
      const response = await fetch('/api/knowledge-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'visa-knowledge', entry })
      });
      
      if (response.ok) {
        const newEntry = await response.json();
        setVisaKnowledgeBase([...visaKnowledgeBase, newEntry]);
      }
    } catch (error) {
      console.error('Error adding visa knowledge:', error);
    }
  };

  // Function to add a new SOP document
  const addSOPDocument = async (doc: any) => {
    try {
      const response = await fetch('/api/knowledge-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sop-docs', doc })
      });
      
      if (response.ok) {
        const newDoc = await response.json();
        setSopDocuments([...sopDocuments, newDoc]);
      }
    } catch (error) {
      console.error('Error adding SOP document:', error);
    }
  };

  // Function to add a new learning guideline
  const addLearningGuideline = async (guideline: any) => {
    try {
      const response = await fetch('/api/knowledge-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'learning-guidelines', guideline })
      });
      
      if (response.ok) {
        const newGuideline = await response.json();
        setLearningGuidelines([...learningGuidelines, newGuideline]);
      }
    } catch (error) {
      console.error('Error adding learning guideline:', error);
    }
  };

  // Function to add a new rejection tip
  const addRejectionTip = async (tip: any) => {
    try {
      const response = await fetch('/api/knowledge-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rejection-tips', tip })
      });
      
      if (response.ok) {
        const newTip = await response.json();
        setRejectionTips([...rejectionTips, newTip]);
      }
    } catch (error) {
      console.error('Error adding rejection tip:', error);
    }
  };

  // Handler functions for form inputs
  const handleVisaKnowledgeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVisaKnowledge(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSOPDocChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSOPDoc(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuidelineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewGuideline(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTip(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for requirements array in visa knowledge
  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...newVisaKnowledge.requirements];
    newRequirements[index] = value;
    setNewVisaKnowledge(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirementField = () => {
    setNewVisaKnowledge(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirementField = (index: number) => {
    if (newVisaKnowledge.requirements.length > 1) {
      const newRequirements = [...newVisaKnowledge.requirements];
      newRequirements.splice(index, 1);
      setNewVisaKnowledge(prev => ({
        ...prev,
        requirements: newRequirements
      }));
    }
  };

  // Handler functions for form submissions
  const handleSubmitVisaKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVisaKnowledge(newVisaKnowledge);
    setNewVisaKnowledge({
      country: '',
      visaType: '',
      requirements: [''],
      processingTime: '',
      fees: '',
      difficulty: 'Medium',
      tips: ''
    });
    setShowVisaKnowledgeModal(false);
  };

  const handleSubmitSOPDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSOPDocument(newSOPDoc);
    setNewSOPDoc({
      title: '',
      type: '',
      country: '',
      version: '1.0',
      content: '',
      author: ''
    });
    setShowSOPModal(false);
  };

  const handleSubmitGuideline = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLearningGuideline(newGuideline);
    setNewGuideline({
      title: '',
      category: '',
      duration: '10 min',
      level: 'Beginner',
      completed: false,
      rating: 0,
      enrolled: 0
    });
    setShowGuidelineModal(false);
  };

  const handleSubmitTip = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRejectionTip(newTip);
    setNewTip({
      country: '',
      visaType: '',
      tipCategory: '',
      title: '',
      description: '',
      solution: '',
      example: ''
    });
    setShowTipModal(false);
  };

  // Edit and Delete functions for Visa Knowledge
  const editVisaKnowledge = (entry: any) => {
    setNewVisaKnowledge({
      country: entry.country,
      visaType: entry.visaType,
      requirements: entry.requirements || [''],
      processingTime: entry.processingTime,
      fees: entry.fees,
      difficulty: entry.difficulty || 'Medium',
      tips: entry.tips
    });
    // We'll need to store the ID to know which entry to update
    // For now, we'll just close the modal after editing
    setShowVisaKnowledgeModal(true);
  };

  const deleteVisaKnowledge = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`/api/knowledge-help?type=visa-knowledge&id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setVisaKnowledgeBase(visaKnowledgeBase.filter((entry: any) => entry._id !== id));
        }
      } catch (error) {
        console.error('Error deleting visa knowledge:', error);
      }
    }
  };

  // View function for SOP Documents
  const viewSOPDocument = (doc: any) => {
    setSelectedSOPDoc(doc);
    setShowSOPViewModal(true);
  };

  // Edit and Delete functions for SOP Documents
  const editSOPDocument = (doc: any) => {
    setNewSOPDoc({
      title: doc.title,
      type: doc.type,
      country: doc.country,
      version: doc.version,
      content: doc.content,
      author: doc.author
    });
    setShowSOPModal(true);
  };

  const deleteSOPDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`/api/knowledge-help?type=sop-docs&id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setSopDocuments(sopDocuments.filter((doc: any) => doc._id !== id));
        }
      } catch (error) {
        console.error('Error deleting SOP document:', error);
      }
    }
  };

  // Edit and Delete functions for Learning Guidelines
  const editLearningGuideline = (guideline: any) => {
    setNewGuideline({
      title: guideline.title,
      category: guideline.category,
      duration: guideline.duration || '10 min',
      level: guideline.level || 'Beginner',
      completed: guideline.completed || false,
      rating: guideline.rating || 0,
      enrolled: guideline.enrolled || 0
    });
    setShowGuidelineModal(true);
  };

  const deleteLearningGuideline = async (id: string) => {
    if (confirm('Are you sure you want to delete this guideline?')) {
      try {
        const response = await fetch(`/api/knowledge-help?type=learning-guidelines&id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setLearningGuidelines(learningGuidelines.filter((guideline: any) => guideline._id !== id));
        }
      } catch (error) {
        console.error('Error deleting learning guideline:', error);
      }
    }
  };

  // Edit and Delete functions for Rejection Tips
  const editRejectionTip = (tip: any) => {
    setNewTip({
      country: tip.country,
      visaType: tip.visaType,
      tipCategory: tip.tipCategory,
      title: tip.title,
      description: tip.description,
      solution: tip.solution,
      example: tip.example
    });
    setShowTipModal(true);
  };

  const deleteRejectionTip = async (id: string) => {
    if (confirm('Are you sure you want to delete this tip?')) {
      try {
        const response = await fetch(`/api/knowledge-help?type=rejection-tips&id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setRejectionTips(rejectionTips.filter((tip: any) => tip._id !== id));
        }
      } catch (error) {
        console.error('Error deleting rejection tip:', error);
      }
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Knowledge & Help System" 
        description="Access visa knowledge base, SOPs, guidelines, and rejection prevention tips"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with search and filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search knowledge base, SOPs, guidelines..."
                  className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Open modal to add new entry based on active tab
                    if (activeTab === 'knowledge-base') {
                      setShowVisaKnowledgeModal(true);
                    } else if (activeTab === 'sop-docs') {
                      setShowSOPModal(true);
                    } else if (activeTab === 'learning-guidelines') {
                      setShowGuidelineModal(true);
                    } else if (activeTab === 'rejection-tips') {
                      setShowTipModal(true);
                    }
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Add New</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('knowledge-base')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'knowledge-base'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Country Visa Knowledge Base</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sop-docs')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sop-docs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>SOP Documentation</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('learning-guidelines')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'learning-guidelines'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Agent Learning Guidelines</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('rejection-tips')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rejection-tips'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Rejection Prevention Tips</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {/* Country Visa Knowledge Base Tab */}
            {activeTab === 'knowledge-base' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visaKnowledgeBase.map((entry) => (
                    <div key={entry._id || entry.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{entry.country}</h3>
                            <p className="text-sm text-gray-600">{entry.visaType}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            entry.difficulty === 'Easy' 
                              ? 'bg-green-100 text-green-800' 
                              : entry.difficulty === 'Medium' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.difficulty}
                          </span>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Processing: {entry.processingTime}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span>Fees: {entry.fees}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {entry.requirements.slice(0, 3).map((req: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {req}
                              </li>
                            ))}
                            {entry.requirements.length > 3 && (
                              <li className="text-blue-600">+ {entry.requirements.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">{entry.tips}</p>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                          <span>Last updated: {entry.lastUpdated}</span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => editVisaKnowledge(entry)}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteVisaKnowledge(entry._id)}
                              className="text-red-600 hover:text-red-800 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Load More Countries
                  </button>
                </div>
              </div>
            )}

            {/* SOP Documentation Tab */}
            {activeTab === 'sop-docs' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sopDocuments.map((doc) => (
                          <tr key={doc._id || doc.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-blue-500 mr-3" />
                                <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.country}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.version}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.lastUpdated}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.author}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => viewSOPDocument(doc)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => editSOPDocument(doc)}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteSOPDocument(doc._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Learning Guidelines Tab */}
            {activeTab === 'learning-guidelines' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {learningGuidelines.map((guideline) => (
                    <div key={guideline._id || guideline.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{guideline.title}</h3>
                            <p className="text-sm text-gray-600">{guideline.category}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            guideline.level === 'Beginner' 
                              ? 'bg-green-100 text-green-800' 
                              : guideline.level === 'Intermediate' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {guideline.level}
                          </span>
                        </div>
                        
                        <div className="mt-4 flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{guideline.duration}</span>
                          <div className="ml-auto flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span>{guideline.rating}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>{guideline.enrolled} enrolled</span>
                        </div>
                        
                        <div className="mt-6 flex justify-between">
                          <button className={`flex-1 mr-2 py-2 px-4 rounded-md text-sm font-medium ${
                            guideline.completed 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}>
                            {guideline.completed ? 'Completed' : 'Start Learning'}
                          </button>
                          <button className="ml-2 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                            Info
                          </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                          <span>Last updated: {guideline.lastUpdated}</span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => editLearningGuideline(guideline)}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteLearningGuideline(guideline._id)}
                              className="text-red-600 hover:text-red-800 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejection Prevention Tips Tab */}
            {activeTab === 'rejection-tips' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rejectionTips.map((tip) => (
                    <div key={tip._id || tip.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                            <p className="text-sm text-gray-600">{tip.country} - {tip.visaType}</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            {tip.tipCategory}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Problem Description</h4>
                          <p className="text-sm text-gray-600">{tip.description}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Solution</h4>
                          <p className="text-sm text-gray-600">{tip.solution}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Real Example</h4>
                          <p className="text-sm text-gray-600 italic">{tip.example}</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Save Tip
                          </button>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => editRejectionTip(tip)}
                              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteRejectionTip(tip._id)}
                              className="text-red-600 hover:text-red-800 flex items-center text-sm"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          
          {/* Modals for adding new entries */}
          
          {/* Visa Knowledge Base Modal */}
          {showVisaKnowledgeModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowVisaKnowledgeModal(false)}>
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Add New Visa Knowledge Entry</span>
                  </h3>
                  <button
                    onClick={() => setShowVisaKnowledgeModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmitVisaKnowledge} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={newVisaKnowledge.country}
                      onChange={handleVisaKnowledgeChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Visa Type *</label>
                    <input
                      type="text"
                      name="visaType"
                      value={newVisaKnowledge.visaType}
                      onChange={handleVisaKnowledgeChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processing Time *</label>
                    <input
                      type="text"
                      name="processingTime"
                      value={newVisaKnowledge.processingTime}
                      onChange={handleVisaKnowledgeChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fees *</label>
                    <input
                      type="text"
                      name="fees"
                      value={newVisaKnowledge.fees}
                      onChange={handleVisaKnowledgeChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty *</label>
                    <select
                      name="difficulty"
                      value={newVisaKnowledge.difficulty}
                      onChange={handleVisaKnowledgeChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Requirements</label>
                    <div className="space-y-2 mt-1">
                      {newVisaKnowledge.requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => handleRequirementChange(index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder={`Requirement ${index + 1}`}
                          />
                          {newVisaKnowledge.requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRequirementField(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addRequirementField}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Requirement
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tips</label>
                    <textarea
                      name="tips"
                      value={newVisaKnowledge.tips}
                      onChange={handleVisaKnowledgeChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowVisaKnowledgeModal(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* SOP Document Modal */}
          {showSOPModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowSOPModal(false)}>
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Add New SOP Document</span>
                  </h3>
                  <button
                    onClick={() => setShowSOPModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmitSOPDoc} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newSOPDoc.title}
                      onChange={handleSOPDocChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <input
                      type="text"
                      name="type"
                      value={newSOPDoc.type}
                      onChange={handleSOPDocChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={newSOPDoc.country}
                      onChange={handleSOPDocChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Version *</label>
                    <input
                      type="text"
                      name="version"
                      value={newSOPDoc.version}
                      onChange={handleSOPDocChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Author *</label>
                    <input
                      type="text"
                      name="author"
                      value={newSOPDoc.author}
                      onChange={handleSOPDocChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content *</label>
                    <textarea
                      name="content"
                      value={newSOPDoc.content}
                      onChange={handleSOPDocChange}
                      rows={5}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSOPModal(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Document
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Learning Guideline Modal */}
          {showGuidelineModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowGuidelineModal(false)}>
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Add New Learning Guideline</span>
                  </h3>
                  <button
                    onClick={() => setShowGuidelineModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmitGuideline} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newGuideline.title}
                      onChange={handleGuidelineChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={newGuideline.category}
                      onChange={handleGuidelineChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={newGuideline.duration}
                      onChange={handleGuidelineChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Level *</label>
                    <select
                      name="level"
                      value={newGuideline.level}
                      onChange={handleGuidelineChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowGuidelineModal(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Guideline
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Rejection Tip Modal */}
          {showTipModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowTipModal(false)}>
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Add New Rejection Prevention Tip</span>
                  </h3>
                  <button
                    onClick={() => setShowTipModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmitTip} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={newTip.country}
                      onChange={handleTipChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Visa Type *</label>
                    <input
                      type="text"
                      name="visaType"
                      value={newTip.visaType}
                      onChange={handleTipChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tip Category *</label>
                    <input
                      type="text"
                      name="tipCategory"
                      value={newTip.tipCategory}
                      onChange={handleTipChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newTip.title}
                      onChange={handleTipChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <textarea
                      name="description"
                      value={newTip.description}
                      onChange={handleTipChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Solution *</label>
                    <textarea
                      name="solution"
                      value={newTip.solution}
                      onChange={handleTipChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Real Example</label>
                    <textarea
                      name="example"
                      value={newTip.example}
                      onChange={handleTipChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTipModal(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Tip
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SOP Document View Modal */}
          {showSOPViewModal && selectedSOPDoc && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowSOPViewModal(false)}>
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>{selectedSOPDoc.title}</span>
                  </h3>
                  <button
                    onClick={() => setShowSOPViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSOPDoc.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSOPDoc.country}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Version</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSOPDoc.version}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Author</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSOPDoc.author}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSOPDoc.lastUpdated}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedSOPDoc.content}</p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowSOPViewModal(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}