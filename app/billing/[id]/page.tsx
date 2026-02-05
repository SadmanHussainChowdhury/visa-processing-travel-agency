'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import { 
  ArrowLeft, 
  Edit, 
  Printer, 
  Download, 
  Calendar,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock
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
    itemType: string;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
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

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusConfig = {
    draft: {
      label: 'Draft',
      color: 'bg-gray-100 text-gray-800',
      icon: FileText
    },
    issued: {
      label: 'Issued',
      color: 'bg-blue-100 text-blue-800',
      icon: Clock
    },
    paid: {
      label: 'Paid',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800',
      icon: XCircle
    }
  };

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

  const handlePrint = () => {
    // Create a print-friendly version of the invoice
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: bold;
              margin: 10px 0;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .detail-section {
              flex: 1;
            }
            .detail-label {
              font-weight: bold;
              margin-bottom: 5px;
              color: #555;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th {
              background-color: #f3f4f6;
              padding: 12px;
              text-align: left;
              border: 1px solid #ddd;
            }
            .items-table td {
              padding: 12px;
              border: 1px solid #ddd;
            }
            .financial-summary {
              width: 300px;
              margin-left: auto;
              margin-top: 30px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .total-row {
              font-weight: bold;
              font-size: 18px;
              border-top: 2px solid #333;
              padding-top: 10px;
              margin-top: 10px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 12px;
            }
            .status-draft { background-color: #f3f4f6; color: #374151; }
            .status-issued { background-color: #dbeafe; color: #1e40af; }
            .status-paid { background-color: #dcfce7; color: #166534; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">VISA PROCESSING AGENCY</div>
            <div class="invoice-title">INVOICE</div>
            <div>Invoice #: ${invoice.invoiceNumber}</div>
            <div>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
          </div>
          
          <div class="invoice-details">
            <div class="detail-section">
              <div class="detail-label">BILL TO:</div>
              <div>${invoice.clientName}</div>
              <div>${invoice.clientEmail}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">STATUS:</div>
              <div class="status-badge status-${invoice.status}">
                ${statusConfig[invoice.status].label}
              </div>
              ${invoice.dueDate ? `<div>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</div>` : ''}
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${invoice.currency} ${item.unitPrice.toFixed(2)}</td>
                  <td>${invoice.currency} ${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="financial-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${invoice.currency} ${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (${invoice.taxRate}%):</span>
              <span>${invoice.currency} ${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
              <span>Total:</span>
              <span>${invoice.currency} ${invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div style="margin-top: 30px;">
              <div class="detail-label">NOTES:</div>
              <div>${invoice.notes}</div>
            </div>
          ` : ''}
          
          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            Thank you for your business!
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;
    
    // Dynamically import jsPDF
    const jsPDF = (await import('jspdf')).jsPDF;
    const doc = new jsPDF();
    
    // Set font and size
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('VISA PROCESSING AGENCY', 105, 20, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 105, 35, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 105, 45, { align: 'center' });
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 105, 52, { align: 'center' });
    
    // Draw line
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);
    
    // Client and status information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 82);
    doc.text(invoice.clientEmail, 20, 89);
    
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS:', 150, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(statusConfig[invoice.status].label.toUpperCase(), 150, 82);
    
    if (invoice.dueDate) {
      doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 150, 89);
    }
    
    // Items table header
    const startY = 100;
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(243, 244, 246);
    doc.rect(20, startY, 170, 10, 'F');
    doc.text('Description', 22, startY + 7);
    doc.text('Qty', 110, startY + 7);
    doc.text('Unit Price', 130, startY + 7);
    doc.text('Amount', 160, startY + 7);
    
    // Items
    doc.setFont('helvetica', 'normal');
    let yPos = startY + 15;
    
    invoice.items.forEach((item, index) => {
      if (yPos > 250) { // Add new page if needed
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(item.description, 22, yPos);
      doc.text(item.quantity.toString(), 110, yPos);
      doc.text(`${invoice.currency} ${item.unitPrice.toFixed(2)}`, 130, yPos);
      doc.text(`${invoice.currency} ${item.amount.toFixed(2)}`, 160, yPos);
      yPos += 10;
    });
    
    // Financial summary
    const summaryStart = yPos + 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 130, summaryStart);
    doc.text(`${invoice.currency} ${invoice.subtotal.toFixed(2)}`, 160, summaryStart);
    
    doc.text(`Tax (${invoice.taxRate}%):`, 130, summaryStart + 7);
    doc.text(`${invoice.currency} ${invoice.taxAmount.toFixed(2)}`, 160, summaryStart + 7);
    
    doc.setFont('helvetica', 'bold');
    doc.setLineWidth(0.3);
    doc.line(130, summaryStart + 12, 190, summaryStart + 12);
    doc.text('TOTAL:', 130, summaryStart + 19);
    doc.text(`${invoice.currency} ${invoice.totalAmount.toFixed(2)}`, 160, summaryStart + 19);
    
    // Notes section
    if (invoice.notes) {
      const notesStart = summaryStart + 30;
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES:', 20, notesStart);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(invoice.notes, 170);
      doc.text(splitNotes, 20, notesStart + 7);
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', 105, 280, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, 190, 280, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Invoice Details" description="View invoice information">
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
        <SidebarLayout title="Invoice Details" description="View invoice information">
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

  const StatusIcon = statusConfig[invoice.status].icon;

  return (
    <ProtectedRoute>
      <SidebarLayout title="Invoice Details" description="View invoice information">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Link href="/billing" className="text-blue-600 hover:text-blue-800">
                  <ArrowLeft className="h-4 w-4 inline mr-2" />
                  Back to Billing
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">
                  Invoice {invoice.invoiceNumber}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button 
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                {(invoice.status === 'draft' || invoice.status === 'issued') && (
                  <button
                    onClick={() => router.push(`/billing/${invoice._id}/edit`)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Header */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
                  <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[invoice.status].color}`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {statusConfig[invoice.status].label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{invoice.clientName}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{invoice.clientEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Dates</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">{formatDateTime(invoice.createdAt)}</span>
                    </div>
                    {invoice.issuedDate && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Issued:</span>
                        <span className="ml-2 font-medium">{formatDate(invoice.issuedDate)}</span>
                      </div>
                    )}
                    {invoice.dueDate && (
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Due:</span>
                        <span className="ml-2 font-medium">{formatDate(invoice.dueDate)}</span>
                      </div>
                    )}
                    {invoice.paidDate && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Paid:</span>
                        <span className="ml-2 font-medium">{formatDate(invoice.paidDate)}</span>
                      </div>
                    )}
                    {invoice.cancelledDate && (
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Cancelled:</span>
                        <span className="ml-2 font-medium">{formatDate(invoice.cancelledDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {item.itemType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.currency} {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {invoice.currency} {(item.amount || (item.quantity * item.unitPrice)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Financial Summary</h2>
            </div>
            <div className="p-6">
              <div className="max-w-xs ml-auto">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {invoice.currency} {invoice.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                    <span className="font-medium">
                      {invoice.currency} {invoice.taxAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {invoice.currency} {invoice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
