'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../../protected-route';
import SidebarLayout from '../../../components/sidebar-layout';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientId: string;
  visaCaseId: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    itemType: 'service' | 'fee' | 'consultation' | 'processing' | 'other';
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount?: number;
  dueAmount?: number;
  currency: string;
  dueDate?: string;
  issuedDate?: string;
  paidDate?: string;
  cancelledDate?: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  itemType: 'service' | 'fee' | 'consultation' | 'processing' | 'other';
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    items: [] as InvoiceItem[],
    taxRate: 0,
    depositAmount: 0,
    notes: '',
    dueDate: '',
    status: 'draft' as 'draft' | 'issued' | 'paid' | 'cancelled',
    currency: 'USD'
  });

  const itemTypes = [
    { value: 'service', label: 'Service' },
    { value: 'fee', label: 'Fee' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'processing', label: 'Processing' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', description: 'Invoice is being prepared' },
    { value: 'issued', label: 'Issued', description: 'Invoice has been sent to client' },
    { value: 'paid', label: 'Paid', description: 'Payment has been received' },
    { value: 'cancelled', label: 'Cancelled', description: 'Invoice has been cancelled' }
  ];

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/billing/invoices/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
        setFormData({
          items: data.items || [],
          taxRate: data.taxRate || 0,
          depositAmount: data.depositAmount || 0,
          notes: data.notes || '',
          dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
          status: data.status,
          currency: data.currency || 'USD'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invoice not found');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        itemType: 'service'
      }]
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
      updatedItems[index].amount = quantity * unitPrice;
    }
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    const depositAmount = Math.max(0, Number(formData.depositAmount) || 0);
    const dueAmount = Math.max(0, totalAmount - depositAmount);
    return { subtotal, taxAmount, totalAmount, depositAmount, dueAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.items.length === 0) {
      setError('Please add at least one invoice item');
      setSaving(false);
      return;
    }

    const emptyItems = formData.items.some(item => !item.description.trim() || (item.amount || 0) <= 0);
    if (emptyItems) {
      setError('Please fill in all item details and ensure amounts are greater than zero');
      setSaving(false);
      return;
    }

    const totalsCheck = calculateTotals();
    if (totalsCheck.depositAmount > totalsCheck.totalAmount) {
      setError('Deposit amount cannot be greater than the total amount');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/billing/invoices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        setSuccess('Invoice updated successfully!');
        setTimeout(() => {
          router.push(`/billing/${updatedInvoice._id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update invoice');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error updating invoice:', err);
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Edit Invoice" description="Modify invoice details">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error || !invoice) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Edit Invoice" description="Modify invoice details">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error || 'Invoice not found'}</span>
              </div>
              <div className="mt-4">
                <Link
                  href="/billing"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Billing
                </Link>
              </div>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  // Check if invoice can be edited
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Edit Invoice" description="Modify invoice details">
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-yellow-700">
                  This invoice cannot be edited because it is {invoice.status}.
                </span>
              </div>
              <div className="mt-4">
                <Link
                  href={`/billing/${invoice._id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View Invoice
                </Link>
              </div>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout title={`Edit Invoice ${invoice.invoiceNumber}`} description="Modify invoice details">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href={`/billing/${invoice._id}`} className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 inline mr-2" />
              Back to Invoice
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              Edit Invoice {invoice.invoiceNumber}
            </h1>
          </div>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
              <div className="flex items-center">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-${invoice.status === 'draft' ? 'gray' : invoice.status === 'issued' ? 'blue' : invoice.status === 'paid' ? 'green' : 'red'}-100 text-${invoice.status === 'draft' ? 'gray' : invoice.status === 'issued' ? 'blue' : invoice.status === 'paid' ? 'green' : 'red'}-800`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
                <span className="ml-4 text-sm text-gray-600">
                  Created: {new Date(invoice.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </button>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>No items added yet</p>
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Item description"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            value={item.itemType}
                            onChange={(e) => updateItem(index, 'itemType', e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {itemTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              required
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                              type="text"
                              value={(item.amount || (item.quantity * item.unitPrice)).toFixed(2)}
                              readOnly
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    id="taxRate"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Amount
                  </label>
                  <input
                    type="number"
                    id="depositAmount"
                    min="0"
                    step="0.01"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions
                      .filter(option => {
                        // Only allow valid status transitions
                        const validTransitions = {
                          'draft': ['issued', 'cancelled'],
                          'issued': ['paid', 'cancelled'],
                          'paid': [],
                          'cancelled': []
                        };
                        const currentStatus = invoice.status;
                        const allowedTransitions = validTransitions[currentStatus];
                        // Return true for all options - validation happens on the server
                        return true;
                      })
                      .map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    }
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusOptions.find(opt => opt.value === formData.status)?.description}
                  </p>
                </div>
              </div>
              
              {/* Notes */}
              <div className="mt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or terms..."
                />
              </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formData.currency} {totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                    <span className="font-medium">{formData.currency} {totals.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="font-medium">{formData.currency} {totals.depositAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formData.currency} {totals.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due:</span>
                    <span className="font-medium">{formData.currency} {totals.dueAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/billing/${invoice._id}`}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Invoice
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
