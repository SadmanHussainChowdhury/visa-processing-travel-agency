'use client';

import { useState } from 'react';
import { paymentProcessor, Payment } from '@/lib/payment-processor';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  clientName: string;
  description: string;
  onSuccess: (payment: Payment) => void;
  onCancel: () => void;
}

export function PaymentForm({ 
  amount, 
  currency = 'USD', 
  clientName, 
  description, 
  onSuccess, 
  onCancel 
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = paymentProcessor.getPaymentMethods();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const payment = await paymentProcessor.processPayment({
        amount,
        currency,
        methodId: selectedMethod,
        description,
        clientName
      });
      
      onSuccess(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Details</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Amount:</span>
          <span className="text-2xl font-bold text-gray-900">
            {currency} {amount.toFixed(2)}
          </span>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No payment methods available</p>
              <button
                type="button"
                onClick={() => {/* Add payment method logic */}}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Add Payment Method
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{method.name}</p>
                      {method.lastFour && (
                        <p className="text-sm text-gray-500">
                          •••• {method.lastFour}
                          {method.expiryDate && ` (Expires ${method.expiryDate})`}
                        </p>
                      )}
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || !selectedMethod || paymentMethods.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Pay Now</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}