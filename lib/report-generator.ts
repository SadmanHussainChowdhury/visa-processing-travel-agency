export interface ReportData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'table' | 'summary';
  data: any[];
  labels?: string[];
  createdAt: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface AnalyticsData {
  clients: {
    total: number;
    newThisMonth: number;
    active: number;
    conversionRate: number;
  };
  appointments: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    completionRate: number;
  };
  payments: {
    totalRevenue: number;
    pendingPayments: number;
    averagePayment: number;
    paymentSuccessRate: number;
  };
  documents: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
  cases: {
    total: number;
    inProgress: number;
    completed: number;
    successRate: number;
  };
}

export class ReportGenerator {
  private static instance: ReportGenerator;

  private constructor() {}

  static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  // Generate client analytics report
  async generateClientReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ReportData> {
    // Simulate data fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = this.generateClientData(period);
    
    return {
      id: this.generateId(),
      title: `Client Analytics - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
      type: 'line',
      data,
      labels: this.generateDateLabels(period),
      createdAt: new Date(),
      period
    };
  }

  // Generate appointment analytics report
  async generateAppointmentReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ReportData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = this.generateAppointmentData(period);
    
    return {
      id: this.generateId(),
      title: `Appointment Analytics - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
      type: 'bar',
      data,
      labels: this.generateDateLabels(period),
      createdAt: new Date(),
      period
    };
  }

  // Generate payment analytics report
  async generatePaymentReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ReportData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = this.generatePaymentData(period);
    
    return {
      id: this.generateId(),
      title: `Payment Analytics - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
      type: 'line',
      data,
      labels: this.generateDateLabels(period),
      createdAt: new Date(),
      period
    };
  }

  // Generate comprehensive dashboard analytics
  async generateDashboardAnalytics(): Promise<AnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      clients: {
        total: 1247,
        newThisMonth: 89,
        active: 342,
        conversionRate: 78.5
      },
      appointments: {
        total: 892,
        completed: 756,
        pending: 89,
        cancelled: 47,
        completionRate: 84.7
      },
      payments: {
        totalRevenue: 125430,
        pendingPayments: 12450,
        averagePayment: 342,
        paymentSuccessRate: 92.3
      },
      documents: {
        total: 2341,
        verified: 1987,
        pending: 234,
        rejected: 120
      },
      cases: {
        total: 567,
        inProgress: 123,
        completed: 444,
        successRate: 87.2
      }
    };
  }

  // Export report to CSV
  exportToCSV(report: ReportData): string {
    let csv = `${report.title}\n`;
    csv += `Generated: ${report.createdAt.toLocaleDateString()}\n\n`;
    
    if (report.labels && report.data.length > 0) {
      // Add headers
      csv += 'Date,';
      if (Array.isArray(report.data[0])) {
        for (let i = 0; i < report.data[0].length; i++) {
          csv += `Series ${i + 1},`;
        }
      } else {
        csv += 'Value,';
      }
      csv = csv.slice(0, -1) + '\n';
      
      // Add data rows
      report.labels.forEach((label, index) => {
        csv += `${label},`;
        if (Array.isArray(report.data[index])) {
          report.data[index].forEach(value => {
            csv += `${value},`;
          });
        } else {
          csv += `${report.data[index]},`;
        }
        csv = csv.slice(0, -1) + '\n';
      });
    }
    
    return csv;
  }

  // Export report to JSON
  exportToJSON(report: ReportData): string {
    return JSON.stringify({
      ...report,
      createdAt: report.createdAt.toISOString()
    }, null, 2);
  }

  // Get report history
  getReportHistory(): ReportData[] {
    const history = localStorage.getItem('reportHistory');
    if (history) {
      try {
        const parsed = JSON.parse(history);
        return parsed.map((report: any) => ({
          ...report,
          createdAt: new Date(report.createdAt)
        }));
      } catch (error) {
        console.error('Failed to parse report history:', error);
      }
    }
    return [];
  }

  // Save report to history
  saveReportToHistory(report: ReportData): void {
    const history = this.getReportHistory();
    history.unshift({
      ...report,
      createdAt: report.createdAt
    });
    
    // Keep only last 50 reports
    const trimmedHistory = history.slice(0, 50);
    
    try {
      localStorage.setItem('reportHistory', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save report history:', error);
    }
  }

  // Generate comparison report
  async generateComparisonReport(
    reportType: 'clients' | 'appointments' | 'payments',
    periods: ['daily' | 'weekly' | 'monthly' | 'yearly', 'daily' | 'weekly' | 'monthly' | 'yearly'] = ['monthly', 'yearly']
  ): Promise<ReportData> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const data = periods.map(period => {
      switch (reportType) {
        case 'clients':
          return this.generateClientData(period);
        case 'appointments':
          return this.generateAppointmentData(period);
        case 'payments':
          return this.generatePaymentData(period);
        default:
          return [];
      }
    });
    
    return {
      id: this.generateId(),
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Comparison Report`,
      type: 'bar',
      data: data.flat(),
      labels: periods.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
      createdAt: new Date(),
      period: 'monthly'
    };
  }

  // Private helper methods
  private generateClientData(period: string): number[] {
    const baseValue = 100;
    const variance = 30;
    const points = this.getPointCount(period);
    
    return Array.from({ length: points }, () => 
      Math.max(0, baseValue + Math.floor(Math.random() * variance * 2) - variance)
    );
  }

  private generateAppointmentData(period: string): number[][] {
    const points = this.getPointCount(period);
    
    return [
      Array.from({ length: points }, () => Math.floor(Math.random() * 50) + 20), // Completed
      Array.from({ length: points }, () => Math.floor(Math.random() * 20) + 5),  // Pending
      Array.from({ length: points }, () => Math.floor(Math.random() * 10) + 1)   // Cancelled
    ];
  }

  private generatePaymentData(period: string): number[] {
    const baseValue = 5000;
    const variance = 2000;
    const points = this.getPointCount(period);
    
    return Array.from({ length: points }, () => 
      Math.max(0, baseValue + Math.floor(Math.random() * variance * 2) - variance)
    );
  }

  private generateDateLabels(period: string): string[] {
    const points = this.getPointCount(period);
    const labels: string[] = [];
    const now = new Date();
    
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now);
      
      switch (period) {
        case 'daily':
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          break;
        case 'weekly':
          date.setDate(date.getDate() - (i * 7));
          labels.push(`Week ${Math.ceil((points - i) / 4)}`);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() - i);
          labels.push(date.getFullYear().toString());
          break;
      }
    }
    
    return labels;
  }

  private getPointCount(period: string): number {
    switch (period) {
      case 'daily': return 30;
      case 'weekly': return 12;
      case 'monthly': return 12;
      case 'yearly': return 5;
      default: return 12;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const reportGenerator = ReportGenerator.getInstance();

// Chart configuration types
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  options: ChartOptions;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    title: {
      display: boolean;
      text: string;
    };
  };
  scales?: {
    y: {
      beginAtZero: boolean;
    };
  };
}

// Report template configurations
export const REPORT_TEMPLATES = {
  clientOverview: {
    title: 'Client Overview Report',
    description: 'Comprehensive client analytics including growth, engagement, and conversion metrics',
    charts: ['clientGrowth', 'clientStatus', 'conversionRate']
  },
  appointmentAnalytics: {
    title: 'Appointment Analytics',
    description: 'Detailed appointment tracking including scheduling, completion, and cancellation rates',
    charts: ['appointmentTrends', 'appointmentStatus', 'completionRate']
  },
  financialSummary: {
    title: 'Financial Summary',
    description: 'Revenue tracking, payment processing, and financial performance metrics',
    charts: ['revenueTrends', 'paymentMethods', 'outstandingPayments']
  },
  operationalDashboard: {
    title: 'Operational Dashboard',
    description: 'Complete operational overview with all key performance indicators',
    charts: ['kpiSummary', 'workflowEfficiency', 'resourceUtilization']
  }
};