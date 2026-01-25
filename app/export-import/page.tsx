'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Users,
  Briefcase,
  Server,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

export default function ExportImportPage() {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'api'>('export');
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{type: string, status: 'idle' | 'uploading' | 'success' | 'error', message: string}>({type: '', status: 'idle', message: ''});

  const handleExport = async (dataType: string, format: string) => {
    try {
      if (format === 'pdf') {
        // For PDF, we'll fetch the HTML content and convert it client-side
        let apiUrl = '';
        if (dataType === 'clients') {
          apiUrl = `/api/export/clients?format=pdf`;
        } else if (dataType === 'applications') {
          apiUrl = `/api/export/applications?format=pdf`;
        } else {
          alert(`PDF export not implemented for ${dataType}`);
          return;
        }
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const htmlContent = await response.text();
        
        // Convert HTML to PDF using jsPDF
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.srcdoc = htmlContent;
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
          setTimeout(() => {
            window.frames[0]?.focus();
            window.frames[0]?.print();
            document.body.removeChild(iframe);
          }, 500);
        };
      } else {
        // For other formats, trigger direct download
        let url = '';
        if (dataType === 'clients') {
          url = `/api/export/clients?format=${format}`;
        } else if (dataType === 'applications') {
          url = `/api/export/applications?format=${format}`;
        } else if (dataType === 'documents') {
          // Placeholder for documents export
          alert(`Exporting ${dataType} in ${format} format`);
          return;
        } else if (dataType === 'reports') {
          // Placeholder for reports export
          alert(`Exporting ${dataType} in ${format} format`);
          return;
        }
        
        // Trigger download
        window.location.href = url;
      }
    } catch (error) {
      console.error(`Error exporting ${dataType}:`, error);
      alert(`Error exporting ${dataType}: ${(error as Error).message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'client' | 'application' | 'document') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'client') {
        setClientFile(file);
      } else if (type === 'application') {
        setApplicationFile(file);
      } else {
        setDocumentFile(file);
      }
    }
  };

  const handleImport = async (type: 'clients' | 'applications' | 'documents') => {
    if (!clientFile && type === 'clients') {
      alert('Please select a client file to import');
      return;
    }
    
    if (!applicationFile && type === 'applications') {
      alert('Please select an application file to import');
      return;
    }
    
    if (!documentFile && type === 'documents') {
      alert('Please select a document file to import');
      return;
    }

    setUploadStatus({type, status: 'uploading', message: `Uploading ${type}...`});
    
    try {
      const formData = new FormData();
      const file = type === 'clients' ? clientFile : type === 'applications' ? applicationFile : documentFile;
      formData.append('file', file!);

      const response = await fetch(`/api/import/${type}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadStatus({type, status: 'success', message: result.message});
        setTimeout(() => setUploadStatus({type: '', status: 'idle', message: ''}), 5000);
      } else {
        setUploadStatus({type, status: 'error', message: result.error || 'Import failed'});
      }
    } catch (error) {
      console.error(`Error importing ${type}:`, error);
      setUploadStatus({type, status: 'error', message: `Import failed: ${(error as Error).message}`});
    }
  };

  const handleDownloadTemplate = (type: string) => {
    // Generate a sample template CSV
    let csvContent = '';
    let fileName = '';
    
    if (type === 'client') {
      csvContent = [
        ['Name', 'Email', 'Phone', 'Country', 'Passport Number', 'Date of Birth', 'Gender', 'Address', 'Emergency Contact', 'Preferred Language', 'Source', 'Status', 'Notes'].join(','),
        ['John Doe', 'john@example.com', '+1234567890', 'USA', 'P12345678', '1990-01-01', 'Male', '123 Main St', 'Jane Doe (+1234567891)', 'English', 'Website', 'active', 'VIP Client'],
        ['Jane Smith', 'jane@example.com', '+0987654321', 'Canada', 'P87654321', '1985-05-15', 'Female', '456 Oak Ave', 'John Smith (+0987654322)', 'English', 'Referral', 'active', 'Regular Customer']
      ].join('\n');
      fileName = 'client_template.csv';
    } else if (type === 'application') {
      csvContent = [
        ['Case ID', 'Client Name', 'Client Email', 'Client Phone', 'Visa Type', 'Country', 'Application Date', 'Submission Date', 'Expected Decision Date', 'Priority', 'Status', 'Notes'].join(','),
        ['VC-2023-1001', 'John Doe', 'john@example.com', '+1234567890', 'Tourist', 'Australia', '2023-01-15', '2023-01-20', '2023-02-15', 'medium', 'in-process', 'Urgent processing required'],
        ['VC-2023-1002', 'Jane Smith', 'jane@example.com', '+0987654321', 'Student', 'UK', '2023-02-01', '2023-02-05', '2023-03-01', 'high', 'submitted', 'Requires additional documentation']
      ].join('\n');
      fileName = 'application_template.csv';
    } else if (type === 'document') {
      csvContent = [
        ['Document ID', 'File Name', 'Original Name', 'File Type', 'File Size', 'Mime Type', 'URL', 'Client ID', 'Client Name', 'Visa Case ID', 'Category', 'Status', 'Uploaded By', 'Expiry Date'].join(','),
        ['DOC-2023-1001', 'passport.pdf', 'John_Doe_Passport.pdf', 'pdf', '1048576', 'application/pdf', 'https://example.com/files/passport.pdf', 'CLIENT-001', 'John Doe', 'VC-2023-1001', 'passport', 'approved', 'admin', '2024-12-31'],
        ['DOC-2023-1002', 'visa.jpg', 'Jane_Smith_Visa.jpg', 'jpg', '2097152', 'image/jpeg', 'https://example.com/files/visa.jpg', 'CLIENT-002', 'Jane Smith', 'VC-2023-1002', 'visa', 'pending', 'admin', '']
      ].join('\n');
      fileName = 'document_template.csv';
    }
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Export & Import" 
        description="Manage data exports, imports, and API integrations"
      >
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('export')}
            >
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('import')}
            >
              <div className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'api'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('api')}
            >
              <div className="flex items-center">
                <Server className="h-4 w-4 mr-2" />
                API Endpoints
              </div>
            </button>
          </div>

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Clients Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Export Clients</h3>
                      <p className="text-gray-600 mt-1">Export all client data to Excel or PDF format</p>
                      <div className="mt-4 flex space-x-3">
                        <button 
                          onClick={() => handleExport('clients', 'excel')}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Excel</span>
                        </button>
                        <button 
                          onClick={() => handleExport('clients', 'pdf')}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          title="Will open print dialog to save as PDF"
                        >
                          <FileText className="h-4 w-4" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Applications Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Export Applications</h3>
                      <p className="text-gray-600 mt-1">Export visa applications data to Excel or PDF format</p>
                      <div className="mt-4 flex space-x-3">
                        <button 
                          onClick={() => handleExport('applications', 'excel')}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Excel</span>
                        </button>
                        <button 
                          onClick={() => handleExport('applications', 'pdf')}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          title="Will open print dialog to save as PDF"
                        >
                          <FileText className="h-4 w-4" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Import Clients Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Import Clients</h3>
                      <p className="text-gray-600 mt-1">Bulk import client data from Excel file</p>
                      <div className="mt-4">
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="client-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">CSV file (MAX. 10MB)</p>
                            </div>
                            <input 
                              id="client-upload" 
                              type="file" 
                              className="hidden" 
                              accept=".csv" 
                              onChange={(e) => handleFileChange(e, 'client')}
                            />
                          </label>
                        </div>
                        {clientFile && (
                          <div className="mt-2 text-sm text-gray-600">
                            Selected: {clientFile.name}
                          </div>
                        )}
                        <button 
                          onClick={() => handleImport('clients')}
                          disabled={!clientFile}
                          className={`mt-4 w-full py-2 rounded-lg transition-colors ${
                            clientFile 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Import Clients
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import Applications Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Import Applications</h3>
                      <p className="text-gray-600 mt-1">Bulk import visa applications from Excel file</p>
                      <div className="mt-4">
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="application-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">CSV file (MAX. 10MB)</p>
                            </div>
                            <input 
                              id="application-upload" 
                              type="file" 
                              className="hidden" 
                              accept=".csv" 
                              onChange={(e) => handleFileChange(e, 'application')}
                            />
                          </label>
                        </div>
                        {applicationFile && (
                          <div className="mt-2 text-sm text-gray-600">
                            Selected: {applicationFile.name}
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-center w-full">
                            <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">CSV file (MAX. 10MB)</p>
                              </div>
                              <input 
                                id="document-upload" 
                                type="file" 
                                className="hidden" 
                                accept=".csv" 
                                onChange={(e) => handleFileChange(e, 'document')}
                              />
                            </label>
                          </div>
                          {documentFile && (
                            <div className="mt-2 text-sm text-gray-600">
                              Selected: {documentFile.name}
                            </div>
                          )}
                          <button 
                            onClick={() => handleImport('documents')}
                            disabled={!documentFile}
                            className={`mt-4 w-full py-2 rounded-lg transition-colors ${
                              documentFile 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Import Documents
                          </button>
                        </div> {/* Close the document upload section div */}
                        <button 
                          onClick={() => handleImport('applications')}
                          disabled={!applicationFile}
                          className={`mt-4 w-full py-2 rounded-lg transition-colors ${
                            applicationFile 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Import Applications
                        </button>
                      </div> {/* Close the flex-1 div */}
                    </div> {/* Close the items-start div */}
                  </div> {/* Close the application card div */}
                </div> {/* Close the grid row div */}

                {/* Import Template Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 md:col-span-2">
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Download Import Templates</h3>
                      <p className="text-gray-600 mt-1">Download Excel templates with required column headers</p>
                      <div className="mt-4 flex space-x-4">
                        <button 
                          onClick={() => handleDownloadTemplate('client')}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Client Template</span>
                        </button>
                        <button 
                          onClick={() => handleDownloadTemplate('application')}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Application Template</span>
                        </button>
                        <button 
                          onClick={() => handleDownloadTemplate('document')}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Document Template</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Status */}
              {uploadStatus.status !== 'idle' && (
                <div className={`p-4 rounded-lg ${
                  uploadStatus.status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                  uploadStatus.status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                  'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  <div className="flex items-center">
                    <span className="font-medium">
                      {uploadStatus.type.charAt(0).toUpperCase() + uploadStatus.type.slice(1)} Import: {uploadStatus.status.charAt(0).toUpperCase() + uploadStatus.status.slice(1)}
                    </span>
                    <span className="ml-2">{uploadStatus.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center">
                  <Server className="h-6 w-6 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">External System Integration</h3>
                </div>
                <p className="text-gray-600 mt-2">API endpoints for integrating with external systems</p>
                
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">GET /api/export/clients</h4>
                        <p className="text-sm text-gray-600">Export all clients in JSON format</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">GET</span>
                        <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">POST /api/import/clients</h4>
                        <p className="text-sm text-gray-600">Import clients from JSON payload</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">POST</span>
                        <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">GET /api/export/applications</h4>
                        <p className="text-sm text-gray-600">Export all applications in JSON format</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">GET</span>
                        <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">POST /api/import/applications</h4>
                        <p className="text-sm text-gray-600">Import applications from JSON payload</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">POST</span>
                        <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    API Documentation
                  </h4>
                  <p className="text-blue-800 mt-1">
                    Visit our API documentation to learn more about integrating with external systems.
                    Authentication is required using Bearer tokens.
                  </p>
                  <button className="mt-3 flex items-center text-blue-700 hover:text-blue-900">
                    View Documentation
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}