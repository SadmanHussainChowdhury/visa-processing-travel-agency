export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'other';
  name: string;
  icon: string;
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  method: PaymentMethod;
  description: string;
  createdAt: Date;
  completedAt?: Date;
  transactionId?: string;
  clientName: string;
  invoiceId?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  clientSecret: string;
  status: string;
}

export class PaymentProcessor {
  private static instance: PaymentProcessor;
  private paymentMethods: PaymentMethod[] = [];
  private payments: Payment[] = [];

  private constructor() {
    this.loadPaymentMethods();
    this.loadPayments();
  }

  static getInstance(): PaymentProcessor {
    if (!PaymentProcessor.instance) {
      PaymentProcessor.instance = new PaymentProcessor();
    }
    return PaymentProcessor.instance;
  }

  // Initialize payment processor with agency configuration
  async initialize() {
    // Load saved payment methods
    this.loadPaymentMethods();
    
    // Initialize payment gateway integrations
    await this.initializePaymentGateways();
  }

  // Process a payment
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    methodId: string;
    description: string;
    clientName: string;
    invoiceId?: string;
  }): Promise<Payment> {
    const method = this.paymentMethods.find(m => m.id === paymentData.methodId);
    if (!method) {
      throw new Error('Payment method not found');
    }

    // Create payment record
    const payment: Payment = {
      id: this.generateId(),
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'pending',
      method,
      description: paymentData.description,
      createdAt: new Date(),
      clientName: paymentData.clientName,
      invoiceId: paymentData.invoiceId
    };

    this.payments.push(payment);
    this.savePayments();

    // Process with payment gateway
    try {
      const result = await this.processWithGateway(payment);
      payment.status = result.success ? 'completed' : 'failed';
      payment.transactionId = result.transactionId;
      payment.completedAt = new Date();
      
      if (result.success) {
        // Update client billing info
        this.updateClientBilling(paymentData.clientName, payment);
      }
    } catch (error) {
      payment.status = 'failed';
      console.error('Payment processing failed:', error);
    }

    this.savePayments();
    return payment;
  }

  // Create payment intent for frontend
  async createPaymentIntent(amount: number, currency: string = 'USD'): Promise<PaymentIntent> {
    // Simulate creating payment intent with Stripe
    return {
      id: this.generateId(),
      amount,
      currency,
      clientSecret: `pi_${this.generateId()}_secret_${this.generateId()}`,
      status: 'requires_payment_method'
    };
  }

  // Get client payment history
  getClientPaymentHistory(clientName: string): Payment[] {
    return this.payments
      .filter(payment => payment.clientName === clientName)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get payment statistics
  getPaymentStatistics(): {
    totalPayments: number;
    totalAmount: number;
    pendingPayments: number;
    successfulPayments: number;
    failedPayments: number;
    averagePaymentAmount: number;
  } {
    const successfulPayments = this.payments.filter(p => p.status === 'completed');
    const pendingPayments = this.payments.filter(p => p.status === 'pending');
    const failedPayments = this.payments.filter(p => p.status === 'failed');
    
    const totalAmount = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const averageAmount = successfulPayments.length > 0 
      ? totalAmount / successfulPayments.length 
      : 0;

    return {
      totalPayments: this.payments.length,
      totalAmount,
      pendingPayments: pendingPayments.length,
      successfulPayments: successfulPayments.length,
      failedPayments: failedPayments.length,
      averagePaymentAmount: averageAmount
    };
  }

  // Add payment method
  async addPaymentMethod(methodData: Omit<PaymentMethod, 'id' | 'isDefault'>): Promise<PaymentMethod> {
    const method: PaymentMethod = {
      ...methodData,
      id: this.generateId(),
      isDefault: this.paymentMethods.length === 0
    };

    this.paymentMethods.push(method);
    this.savePaymentMethods();
    
    return method;
  }

  // Get available payment methods
  getPaymentMethods(): PaymentMethod[] {
    return [...this.paymentMethods];
  }

  // Set default payment method
  setDefaultPaymentMethod(methodId: string): void {
    this.paymentMethods.forEach(method => {
      method.isDefault = method.id === methodId;
    });
    this.savePaymentMethods();
  }

  // Remove payment method
  removePaymentMethod(methodId: string): void {
    this.paymentMethods = this.paymentMethods.filter(method => method.id !== methodId);
    this.savePaymentMethods();
  }

  // Refund a payment
  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }

    const refundAmount = amount || payment.amount;
    
    // Process refund with payment gateway
    try {
      await this.processRefund(payment, refundAmount);
      
      // Create refund record
      const refund: Payment = {
        id: this.generateId(),
        amount: -refundAmount,
        currency: payment.currency,
        status: 'refunded',
        method: payment.method,
        description: `Refund for payment ${payment.id}`,
        createdAt: new Date(),
        completedAt: new Date(),
        transactionId: this.generateId(),
        clientName: payment.clientName,
        invoiceId: payment.invoiceId
      };

      this.payments.push(refund);
      this.savePayments();
      
      return refund;
    } catch (error) {
      throw new Error(`Refund failed: ${error}`);
    }
  }

  // Private methods
  private async initializePaymentGateways() {
    // Initialize Stripe, PayPal, etc.
    console.log('Initializing payment gateways...');
  }

  private async processWithGateway(payment: Payment): Promise<{ success: boolean; transactionId?: string }> {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% success rate for demo
    const success = Math.random() > 0.1;
    
    return {
      success,
      transactionId: success ? `txn_${this.generateId()}` : undefined
    };
  }

  private async processRefund(payment: Payment, amount: number): Promise<void> {
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Refunded $${amount} to ${payment.clientName}`);
  }

  private updateClientBilling(clientName: string, payment: Payment): void {
    // Update client billing information
    console.log(`Updated billing for ${clientName}: ${payment.amount} ${payment.currency}`);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private savePaymentMethods(): void {
    try {
      localStorage.setItem('paymentMethods', JSON.stringify(this.paymentMethods));
    } catch (error) {
      console.error('Failed to save payment methods:', error);
    }
  }

  private loadPaymentMethods(): void {
    try {
      const saved = localStorage.getItem('paymentMethods');
      if (saved) {
        this.paymentMethods = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  }

  private savePayments(): void {
    try {
      const paymentsToSave = this.payments.map(payment => ({
        ...payment,
        createdAt: payment.createdAt.toISOString(),
        completedAt: payment.completedAt?.toISOString()
      }));
      localStorage.setItem('payments', JSON.stringify(paymentsToSave));
    } catch (error) {
      console.error('Failed to save payments:', error);
    }
  }

  private loadPayments(): void {
    try {
      const saved = localStorage.getItem('payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.payments = parsed.map((payment: any) => ({
          ...payment,
          createdAt: new Date(payment.createdAt),
          completedAt: payment.completedAt ? new Date(payment.completedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  }
}

// Export singleton instance
export const paymentProcessor = PaymentProcessor.getInstance();

// Note: React components have been moved to separate files for proper TypeScript compilation