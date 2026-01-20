'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Receipt, Calculator, Globe, Filter, Search, Download, Eye, Edit, Trash2, Plus } from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';

interface FeeStructure {
  id: string;
  name: string;
  governmentFee: number;
  serviceFee: number;
  currency: string;
  description: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit-card' | 'bank-transfer' | 'paypal' | 'cash';
  transactionId: string;
  date: string;
  gateway: string;
}

export default function PaymentBillingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPaymentData();
  }, [activeTab]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      // Fetch data from specialized API routes
      const [paymentRes, feeStructureRes, invoiceRes, paymentDetailsRes, currencyRes] = await Promise.all([
        fetch('/api/payment-billing'),
        fetch('/api/payment-billing/fee-structure'),
        fetch('/api/payment-billing/invoices'),
        fetch('/api/payment-billing/payments'),
        fetch('/api/payment-billing/currency')
      ]);
      
      const paymentData = await paymentRes.json();
      const feeStructureData = await feeStructureRes.json();
      const invoiceData = await invoiceRes.json();
      const paymentDetailsData = await paymentDetailsRes.json();
      const currencyData = await currencyRes.json();
      
      // Set the data in state
      setFeeStructures(feeStructureData.feeStructures || []);
      setInvoices(invoiceData.invoices || []);
      setPayments(paymentDetailsData.payments || []);
      
      // Update currencies state if needed
      if (currencyData.currencies) {
        setCurrencies(currencyData.currencies.map((curr: any) => curr.code));
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      // Fallback to sample data
      const sampleFeeStructures: FeeStructure[] = [
        {
          id: 'fs1',
          name: 'Tourist Visa',
          governmentFee: 160,
          serviceFee: 50,
          currency: 'USD',
          description: 'Standard tourist visa processing'
        },
        {
          id: 'fs2',
          name: 'Business Visa',
          governmentFee: 190,
          serviceFee: 75,
          currency: 'USD',
          description: 'Business visa with expedited processing'
        },
        {
          id: 'fs3',
          name: 'Student Visa',
          governmentFee: 180,
          serviceFee: 60,
          currency: 'USD',
          description: 'Student visa with documentation support'
        },
        {
          id: 'fs4',
          name: 'Transit Visa',
          governmentFee: 90,
          serviceFee: 30,
          currency: 'USD',
          description: 'Short-term transit visa'
        },
        {
          id: 'fs5',
          name: 'Work Visa',
          governmentFee: 250,
          serviceFee: 100,
          currency: 'USD',
          description: 'Employment-based visa with legal support'
        },
        {
          id: 'fs6',
          name: 'Family Reunion Visa',
          governmentFee: 220,
          serviceFee: 80,
          currency: 'USD',
          description: 'Family reunification visa processing'
        },
        {
          id: 'fs7',
          name: 'Medical Visa',
          governmentFee: 180,
          serviceFee: 70,
          currency: 'USD',
          description: 'Medical treatment visa with assistance'
        },
        {
          id: 'fs8',
          name: 'Diplomatic Visa',
          governmentFee: 0,
          serviceFee: 50,
          currency: 'USD',
          description: 'Diplomatic and official visa processing'
        }
      ];

      const sampleInvoices: Invoice[] = [
        {
          id: 'inv1',
          invoiceNumber: 'INV-2024-001',
          clientName: 'John Smith',
          clientId: 'CL001',
          issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          totalAmount: 210,
          currency: 'USD',
          status: 'paid',
          items: [
            {
              id: 'item1',
              description: 'Tourist Visa Processing',
              quantity: 1,
              unitPrice: 160,
              total: 160
            },
            {
              id: 'item2',
              description: 'Service Fee',
              quantity: 1,
              unitPrice: 50,
              total: 50
            }
          ]
        },
        {
          id: 'inv2',
          invoiceNumber: 'INV-2024-002',
          clientName: 'Sarah Johnson',
          clientId: 'CL002',
          issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          totalAmount: 265,
          currency: 'USD',
          status: 'sent',
          items: [
            {
              id: 'item3',
              description: 'Business Visa Processing',
              quantity: 1,
              unitPrice: 190,
              total: 190
            },
            {
              id: 'item4',
              description: 'Expedited Service',
              quantity: 1,
              unitPrice: 75,
              total: 75
            }
          ]
        },
        {
          id: 'inv3',
          invoiceNumber: 'INV-2024-003',
          clientName: 'Michael Brown',
          clientId: 'CL003',
          issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
          totalAmount: 240,
          currency: 'USD',
          status: 'draft',
          items: [
            {
              id: 'item5',
              description: 'Student Visa Processing',
              quantity: 1,
              unitPrice: 180,
              total: 180
            },
            {
              id: 'item6',
              description: 'Documentation Support',
              quantity: 1,
              unitPrice: 60,
              total: 60
            }
          ]
        },
        {
          id: 'inv4',
          invoiceNumber: 'INV-2024-004',
          clientName: 'Emma Wilson',
          clientId: 'CL004',
          issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
          totalAmount: 350,
          currency: 'USD',
          status: 'paid',
          items: [
            {
              id: 'item7',
              description: 'Work Visa Processing',
              quantity: 1,
              unitPrice: 250,
              total: 250
            },
            {
              id: 'item8',
              description: 'Legal Support Service',
              quantity: 1,
              unitPrice: 100,
              total: 100
            }
          ]
        },
        {
          id: 'inv5',
          invoiceNumber: 'INV-2024-005',
          clientName: 'David Chen',
          clientId: 'CL005',
          issueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
          totalAmount: 300,
          currency: 'USD',
          status: 'overdue',
          items: [
            {
              id: 'item9',
              description: 'Medical Visa Processing',
              quantity: 1,
              unitPrice: 180,
              total: 180
            },
            {
              id: 'item10',
              description: 'Medical Assistance Package',
              quantity: 1,
              unitPrice: 70,
              total: 70
            },
            {
              id: 'item11',
              description: 'Travel Insurance',
              quantity: 1,
              unitPrice: 50,
              total: 50
            }
          ]
        }
      ];

      const samplePayments: Payment[] = [
        {
          id: 'pay1',
          invoiceId: 'inv1',
          invoiceNumber: 'INV-2024-001',
          clientName: 'John Smith',
          amount: 210,
          currency: 'USD',
          status: 'completed',
          method: 'credit-card',
          transactionId: 'txn_123456789',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          gateway: 'Stripe'
        },
        {
          id: 'pay2',
          invoiceId: 'inv2',
          invoiceNumber: 'INV-2024-002',
          clientName: 'Sarah Johnson',
          amount: 265,
          currency: 'USD',
          status: 'pending',
          method: 'bank-transfer',
          transactionId: 'bt_987654321',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          gateway: 'Bank Transfer'
        },
        {
          id: 'pay3',
          invoiceId: 'inv3',
          invoiceNumber: 'INV-2024-003',
          clientName: 'Michael Brown',
          amount: 240,
          currency: 'USD',
          status: 'pending',
          method: 'paypal',
          transactionId: 'pp_456789123',
          date: new Date(Date.now()).toISOString(),
          gateway: 'PayPal'
        },
        {
          id: 'pay4',
          invoiceId: 'inv4',
          invoiceNumber: 'INV-2024-004',
          clientName: 'Emma Wilson',
          amount: 350,
          currency: 'USD',
          status: 'completed',
          method: 'bank-transfer',
          transactionId: 'bt_112233445',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          gateway: 'Bank Transfer'
        },
        {
          id: 'pay5',
          invoiceId: 'inv5',
          invoiceNumber: 'INV-2024-005',
          clientName: 'David Chen',
          amount: 300,
          currency: 'USD',
          status: 'failed',
          method: 'credit-card',
          transactionId: 'txn_fail_55667788',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          gateway: 'Stripe'
        }
      ];

      setFeeStructures(sampleFeeStructures);
      setInvoices(sampleInvoices);
      setPayments(samplePayments);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const response = await fetch('/api/payment-billing/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-invoice',
          clientId: 'CL001',
          clientName: 'New Visa Client',
          items: [{
            description: 'Tourist Visa Processing',
            quantity: 1,
            unitPrice: 160,
            total: 160
          },
          {
            description: 'Service Fee',
            quantity: 1,
            unitPrice: 50,
            total: 50
          }],
          currency: 'USD',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Invoice creation result:', result);
        alert(`Visa Invoice ${result.invoice.invoiceNumber} created successfully`);
        // Refresh the data
        loadPaymentData();
      } else {
        const errorData = await response.json();
        console.error('Invoice creation error response:', errorData);
        alert(`Failed to create visa invoice: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating visa invoice:', error);
      alert('Failed to create visa invoice');
    }
  };

  const handleEditInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to edit this visa invoice?')) {
      return;
    }
    
    try {
      console.log('Attempting to update visa invoice with ID:', invoiceId);
      
      const response = await fetch('/api/payment-billing/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-invoice',
          id: invoiceId,
          clientId: 'CL001',
          clientName: 'Updated Visa Client',
          totalAmount: 250,
          currency: 'USD',
          status: 'sent',
          items: [{
            description: 'Business Visa Processing',
            quantity: 1,
            unitPrice: 190,
            total: 190
          },
          {
            description: 'Expedited Service',
            quantity: 1,
            unitPrice: 60,
            total: 60
          }],
          notes: 'Updated visa invoice'
        }),
      });
      
      console.log('Update visa invoice response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Visa invoice update result:', result);
        alert(`Visa Invoice updated successfully: ${result.invoice.invoiceNumber}`);
        // Refresh the data
        loadPaymentData();
      } else {
        const errorData = await response.json();
        console.error('Visa invoice update error response:', errorData);
        alert(`Failed to update visa invoice: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating visa invoice:', error);
      alert('Failed to update visa invoice');
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    alert(`View visa invoice ${invoiceId} details`);
  };



  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this visa invoice?')) {
      try {
        const response = await fetch('/api/payment-billing/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete-invoice',
            id: invoiceId
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          alert('Visa invoice deleted successfully');
          // Refresh the data
          loadPaymentData();
        } else {
          alert('Failed to delete visa invoice');
        }
      } catch (error) {
        console.error('Error deleting visa invoice:', error);
        alert('Failed to delete visa invoice');
      }
    }
  };

  const handlePrintInvoice = (invoiceId: string) => {
    alert(`Print visa invoice ${invoiceId}`);
  };

  const handleProcessPayment = async (invoiceId: string) => {
    try {
      console.log('Attempting to process visa payment for invoice ID:', invoiceId);
      
      const response = await fetch('/api/payment-billing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-payment',
          invoiceId: invoiceId,
          amount: 210,
          method: 'credit-card',
          gateway: 'Stripe',
          currency: 'USD'
        }),
      });
      
      console.log('Process visa payment response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Visa payment process result:', result);
        alert(`Visa payment processed successfully for invoice ${invoiceId}`);
        // Refresh the data
        loadPaymentData();
      } else {
        const errorData = await response.json();
        console.error('Visa payment process error response:', errorData);
        alert(`Failed to process visa payment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing visa payment:', error);
      alert('Failed to process visa payment');
    }
  };

  const handleAddPayment = async () => {
    try {
      // First, let's get an existing invoice to attach the payment to
      if (invoices.length === 0) {
        alert('No visa invoices available to create a payment for. Please create a visa invoice first.');
        return;
      }
      
      const sampleInvoice = invoices[0]; // Use the first invoice as an example
      
      // Log the invoice ID for debugging
      console.log('Attempting to create visa payment for invoice ID:', sampleInvoice.id);
      
      const response = await fetch('/api/payment-billing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-payment',
          invoiceId: sampleInvoice.id,
          amount: 150,
          currency: 'USD',
          status: 'completed',
          method: 'credit-card',
          gateway: 'Stripe',
          transactionId: `txn_${Date.now()}`
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Visa payment creation result:', result);
        alert(`Visa payment added successfully: ${result.payment.transactionId}`);
        // Refresh the data
        loadPaymentData();
      } else {
        const errorData = await response.json();
        console.error('Visa payment creation error response:', errorData);
        alert(`Failed to add visa payment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding visa payment:', error);
      alert('Failed to add visa payment');
    }
  };

  const handleEditPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to edit this visa payment?')) {
      return;
    }
    
    try {
      console.log('Attempting to update visa payment with ID:', paymentId);
      
      const response = await fetch('/api/payment-billing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-payment',
          id: paymentId,
          amount: 250, // In a real app, this would come from a form
          currency: 'USD',
          status: 'completed',
          method: 'bank-transfer',
          gateway: 'Bank Transfer',
          transactionId: 'updated_txn_123'
        }),
      });
      
      console.log('Update visa payment response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Visa payment update result:', result);
        alert(`Visa payment updated successfully: ${result.payment.transactionId}`);
        // Refresh the data
        loadPaymentData();
      } else {
        const errorData = await response.json();
        console.error('Visa payment update error response:', errorData);
        alert(`Failed to update visa payment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating visa payment:', error);
      alert('Failed to update visa payment');
    }
  };

  const renderOverview = () => {
    // Calculate metrics from the fetched data
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const invoicesSent = invoices.filter(i => i.status === 'sent').length;
    const invoicesPaid = invoices.filter(i => i.status === 'paid').length;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Receipt className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Invoices Paid</p>
              <p className="text-2xl font-bold text-gray-900">{invoicesPaid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Calculator className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">${pendingPayments.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Globe className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Currencies</p>
              <p className="text-2xl font-bold text-gray-900">{currencies.length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeeStructure = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Visa Fee Structure</h3>
          <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Plus className="h-4 w-4 mr-1" />
            Add Visa Fee
          </button>
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
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Government Fee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Fee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Fee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeStructures.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.currency} {fee.governmentFee.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.currency} {fee.serviceFee.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fee.currency} {(fee.governmentFee + fee.serviceFee).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.currency}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {fee.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderInvoices = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Visa Invoices</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button 
              onClick={handleCreateInvoice}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Visa Invoice
            </button>
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search..."
                />
              </div>
            </div>
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
                  Invoice #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.currency} {invoice.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(invoice.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Visa Payment Status</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button 
              onClick={handleAddPayment}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Visa Payment
            </button>
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
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
                  Transaction ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.currency} {payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.method.replace('-', ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.gateway}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditPayment(payment.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCurrencySupport = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Multi-Currency for Visa Fees</h3>
          <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Plus className="h-4 w-4 mr-1" />
            Add Supported Currency
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currencies.map((currency, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{currency}</h4>
                    <p className="text-sm text-gray-500">Currency Code</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Active</span>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Enabled
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Currency Exchange Rates</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Currency
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target Currency
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      USD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      EUR
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      0.92
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      USD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      GBP
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      0.79
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      USD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      CAD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      1.36
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Payment & Billing" 
        description="Manage visa processing fees, client invoices, payments, and multi-currency support for travel agency operations"
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
                <CreditCard className="h-4 w-4 mr-2" />
                Financial Overview
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'fee-structure'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('fee-structure')}
            >
              <div className="flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Fee Structure
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('invoices')}
            >
              <div className="flex items-center">
                <Receipt className="h-4 w-4 mr-2" />
                Invoices
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Status
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'currency'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('currency')}
            >
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Multi-Currency
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'fee-structure' && renderFeeStructure()}
          {activeTab === 'invoices' && renderInvoices()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'currency' && renderCurrencySupport()}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}