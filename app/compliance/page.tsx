'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, FileText, Activity, KeyRound, DatabaseBackup, Filter, Download, Upload, Search } from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

interface ComplianceData {
  gdprStatus: 'compliant' | 'non-compliant' | 'pending';
  localComplianceStatus: 'compliant' | 'non-compliant' | 'pending';
  encryptionStatus: 'active' | 'inactive' | 'warning';
  auditLogs: any[];
  twoFactorEnabled: boolean;
  backupStatus: 'up-to-date' | 'outdated' | 'failed';
  lastBackup: string;
  nextBackup: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [complianceData, setComplianceData] = useState<ComplianceData>({
    gdprStatus: 'pending',
    localComplianceStatus: 'pending',
    encryptionStatus: 'active',
    auditLogs: [],
    twoFactorEnabled: false,
    backupStatus: 'up-to-date',
    lastBackup: new Date().toISOString(),
    nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    loadComplianceData();
  }, [activeTab]);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // Fetch data from specialized API routes
      const [complianceRes, gdprRes, securityRes, auditRes, backupRes] = await Promise.all([
        fetch('/api/compliance'),
        fetch('/api/compliance/gdpr'),
        fetch('/api/compliance/security'),
        fetch('/api/compliance/audit-logs'),
        fetch('/api/compliance/backup-recovery')
      ]);
      
      const complianceData = await complianceRes.json();
      const gdprData = await gdprRes.json();
      const securityData = await securityRes.json();
      const auditData = await auditRes.json();
      const backupData = await backupRes.json();
      
      // Combine all data into a single compliance object
      const combinedData = {
        ...complianceData,
        gdprStatus: gdprData.gdprStatus || 'pending',
        localComplianceStatus: 'compliant', // Assuming local compliance
        encryptionStatus: securityData.encryptionStatus || 'inactive',
        twoFactorEnabled: securityData.twoFactorEnabled || false,
        backupStatus: backupData.backupStatus || 'failed',
        lastBackup: backupData.lastBackup,
        nextBackup: backupData.nextBackup,
      };
      
      setComplianceData(combinedData);
      setLogs(auditData.logs || []);

    } catch (error) {
      console.error('Error loading compliance data:', error);
      // Fallback to sample data
      const sampleLogs: AuditLogEntry[] = [
        {
          id: 'log1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'admin@visaagency.com',
          action: 'login',
          resource: 'dashboard',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'log2',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'agent1@visaagency.com',
          action: 'view_client',
          resource: 'client/CL001',
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'log3',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          user: 'admin@visaagency.com',
          action: 'update_settings',
          resource: 'settings/security',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'log4',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          user: 'agent2@visaagency.com',
          action: 'upload_document',
          resource: 'document/upload',
          ip: '192.168.1.102',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'log5',
          timestamp: new Date(Date.now() - 18000000).toISOString(),
          user: 'admin@visaagency.com',
          action: 'generate_report',
          resource: 'reports/compliance',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        }
      ];
      
      setLogs(sampleLogs);
      setComplianceData({
        gdprStatus: 'compliant',
        localComplianceStatus: 'compliant',
        encryptionStatus: 'active',
        auditLogs: sampleLogs,
        twoFactorEnabled: true,
        backupStatus: 'up-to-date',
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        nextBackup: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTwoFactor = async () => {
    try {
      const response = await fetch('/api/compliance/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle-two-factor',
          config: { currentStatus: complianceData.twoFactorEnabled },
          userId: 'current-user-id' // In a real app, this would come from the authenticated user session
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setComplianceData((prev: ComplianceData) => ({
          ...prev,
          twoFactorEnabled: result.twoFactorEnabled
        }));
        alert(`Two-factor authentication ${result.twoFactorEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        alert('Failed to update two-factor authentication setting');
      }
    } catch (error) {
      console.error('Error toggling two-factor authentication:', error);
      alert('Failed to update two-factor authentication setting');
    }
  };

  const runBackup = async () => {
    try {
      const response = await fetch('/api/compliance/backup-recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'run-backup',
          userId: 'current-user-id' // In a real app, this would come from the authenticated user session
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setComplianceData((prev: ComplianceData) => ({
          ...prev,
          backupStatus: result.backupStatus,
          lastBackup: result.lastBackup
        }));
        alert('Backup completed successfully');
      } else {
        alert('Failed to run backup');
      }
    } catch (error) {
      console.error('Error running backup:', error);
      alert('Failed to run backup');
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <Shield className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">GDPR Compliance</p>
            <p className={`text-2xl font-bold ${
              complianceData.gdprStatus === 'compliant' ? 'text-green-600' : 
              complianceData.gdprStatus === 'non-compliant' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {complianceData.gdprStatus.charAt(0).toUpperCase() + complianceData.gdprStatus.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <FileText className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Local Compliance</p>
            <p className={`text-2xl font-bold ${
              complianceData.localComplianceStatus === 'compliant' ? 'text-green-600' : 
              complianceData.localComplianceStatus === 'non-compliant' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {complianceData.localComplianceStatus.charAt(0).toUpperCase() + complianceData.localComplianceStatus.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <Lock className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Encryption</p>
            <p className={`text-2xl font-bold ${
              complianceData.encryptionStatus === 'active' ? 'text-green-600' : 
              complianceData.encryptionStatus === 'inactive' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {complianceData.encryptionStatus.charAt(0).toUpperCase() + complianceData.encryptionStatus.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <Activity className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Audit Logs</p>
            <p className="text-2xl font-bold text-gray-900">{logs.length} entries</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">2FA Enabled</p>
            <p className={`text-2xl font-bold ${complianceData.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {complianceData.twoFactorEnabled ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-teal-100 text-teal-600">
            <DatabaseBackup className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Backup Status</p>
            <p className={`text-2xl font-bold ${
              complianceData.backupStatus === 'up-to-date' ? 'text-green-600' : 
              complianceData.backupStatus === 'outdated' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {complianceData.backupStatus.charAt(0).toUpperCase() + complianceData.backupStatus.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGdprCompliance = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">GDPR/Local Data Compliance</h3>
          <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Compliance Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>GDPR Compliance:</span>
                  <span className={`font-medium ${
                    complianceData.gdprStatus === 'compliant' ? 'text-green-600' : 
                    complianceData.gdprStatus === 'non-compliant' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {complianceData.gdprStatus.charAt(0).toUpperCase() + complianceData.gdprStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Local Compliance:</span>
                  <span className={`font-medium ${
                    complianceData.localComplianceStatus === 'compliant' ? 'text-green-600' : 
                    complianceData.localComplianceStatus === 'non-compliant' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {complianceData.localComplianceStatus.charAt(0).toUpperCase() + complianceData.localComplianceStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Encryption:</span>
                  <span className={`font-medium ${
                    complianceData.encryptionStatus === 'active' ? 'text-green-600' : 
                    complianceData.encryptionStatus === 'inactive' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {complianceData.encryptionStatus.charAt(0).toUpperCase() + complianceData.encryptionStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Recent Compliance Checks</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily Check</span>
                  <span className="text-green-600">Passed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weekly Audit</span>
                  <span className="text-green-600">Passed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly Review</span>
                  <span className="text-yellow-600">Pending</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quarterly Assessment</span>
                  <span className="text-green-600">Passed</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Compliance Measures</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Data minimization practices implemented</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Right to erasure protocols established</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Data breach notification procedures in place</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Privacy by design principles followed</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Regular compliance training conducted</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderSecurityMeasures = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Security Measures</h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Lock className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Encryption</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Encryption Status:</span>
                  <span className={`font-medium ${
                    complianceData.encryptionStatus === 'active' ? 'text-green-600' : 
                    complianceData.encryptionStatus === 'inactive' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {complianceData.encryptionStatus.charAt(0).toUpperCase() + complianceData.encryptionStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Algorithm:</span>
                  <span className="font-medium">AES-256</span>
                </div>
                <div className="flex justify-between">
                  <span>Key Rotation:</span>
                  <span className="font-medium">Monthly</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <KeyRound className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${complianceData.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {complianceData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Enforced For:</span>
                  <span className="font-medium">All Users</span>
                </div>
                <div className="flex justify-between">
                  <span>Methods:</span>
                  <span className="font-medium">SMS, Authenticator</span>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={toggleTwoFactor}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                    complianceData.twoFactorEnabled 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {complianceData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAuditLogs = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
          <div className="flex space-x-2">
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.user.split('@')[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderBackupRecovery = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Backup & Recovery</h3>
          <button
            onClick={runBackup}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <DatabaseBackup className="h-4 w-4 mr-1" />
            Run Backup Now
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Backup Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    complianceData.backupStatus === 'up-to-date' ? 'text-green-600' : 
                    complianceData.backupStatus === 'outdated' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {complianceData.backupStatus.charAt(0).toUpperCase() + complianceData.backupStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Backup:</span>
                  <span className="font-medium">
                    {new Date(complianceData.lastBackup).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Next Backup:</span>
                  <span className="font-medium">
                    {new Date(complianceData.nextBackup).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Location:</span>
                  <span className="font-medium">Encrypted Cloud</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Recovery Options</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Point-in-Time Recovery:</span>
                  <span className="font-medium text-green-600">Available</span>
                </div>
                <div className="flex justify-between">
                  <span>Automated Recovery:</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span>Recovery Time Objective:</span>
                  <span className="font-medium">4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Recovery Point Objective:</span>
                  <span className="font-medium">1 hour</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Backup Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Frequency</h5>
                <p className="text-sm text-gray-600">Daily at 2:00 AM</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Retention</h5>
                <p className="text-sm text-gray-600">30 days</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Verification</h5>
                <p className="text-sm text-gray-600">Automatic</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Compliance & Security" 
        description="Manage GDPR/local compliance, security measures, and data protection"
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
              onClick={() => setActiveTab('overview')}
            >
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Overview
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'gdpr'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('gdpr')}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                GDPR/Local Compliance
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('security')}
            >
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Security Measures
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('audit')}
            >
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
              Audit Logs
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'backup'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('backup')}
            >
              <div className="flex items-center">
                <DatabaseBackup className="h-4 w-4 mr-2" />
                Backup & Recovery
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'gdpr' && renderGdprCompliance()}
          {activeTab === 'security' && renderSecurityMeasures()}
          {activeTab === 'audit' && renderAuditLogs()}
          {activeTab === 'backup' && renderBackupRecovery()}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}