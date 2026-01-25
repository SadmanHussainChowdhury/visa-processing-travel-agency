// Helper function to calculate success probability based on various factors
export const calculateSuccessProbability = (visaCase: any): number => {
  let probability = 70; // Base probability
  
  // Adjust based on visa type and country
  if (visaCase.visaType.toLowerCase().includes('tourist')) {
    probability += 5;
  } else if (visaCase.visaType.toLowerCase().includes('student')) {
    probability -= 5;
  } else if (visaCase.visaType.toLowerCase().includes('work')) {
    probability += 10;
  }
  
  // Adjust based on country
  const highSuccessCountries = ['canada', 'australia', 'uk'];
  const mediumSuccessCountries = ['usa', 'germany', 'france'];
  
  if (highSuccessCountries.includes(visaCase.country.toLowerCase())) {
    probability += 10;
  } else if (mediumSuccessCountries.includes(visaCase.country.toLowerCase())) {
    probability += 5;
  }
  
  // Adjust based on financial documentation (if available)
  if (visaCase.documents) {
    const financialDocs = visaCase.documents.filter((doc: any) => 
      doc.type.toLowerCase().includes('financial') && doc.uploaded
    );
    if (financialDocs.length > 0) {
      probability += 15;
    }
  }
  
  // Adjust based on travel history (if available)
  if (visaCase.travelHistory && visaCase.travelHistory.length > 0) {
    probability += 10;
  }
  
  // Adjust based on previous visa denials
  if (visaCase.alerts && visaCase.alerts.some((alert: any) => 
    alert.message.toLowerCase().includes('denied') || alert.message.toLowerCase().includes('rejected')
  )) {
    probability -= 20;
  }
  
  // Adjust based on application completeness
  if (visaCase.documents) {
    const requiredDocs = visaCase.documents.filter((doc: any) => doc.required);
    const uploadedDocs = visaCase.documents.filter((doc: any) => doc.uploaded);
    const completenessRatio = uploadedDocs.length / requiredDocs.length;
    
    if (completenessRatio < 1) {
      probability -= (1 - completenessRatio) * 20; // Reduce probability based on missing docs
    }
  }
  
  // Ensure probability stays within bounds
  return Math.max(10, Math.min(95, probability));
};

// Helper function to determine risk level based on various factors
export const determineRiskLevel = (visaCase: any, successProbability: number): 'low' | 'medium' | 'high' | 'critical' => {
  // Check for risk indicators
  let riskIndicators = 0;
  
  // Check for incomplete documents
  if (visaCase.documents) {
    const requiredDocs = visaCase.documents.filter((doc: any) => doc.required);
    const uploadedDocs = visaCase.documents.filter((doc: any) => doc.uploaded);
    const missingDocs = requiredDocs.length - uploadedDocs.length;
    
    if (missingDocs > 2) riskIndicators++;
    if (missingDocs > 5) riskIndicators++;
  }
  
  // Check for alerts
  if (visaCase.alerts) {
    const urgentAlerts = visaCase.alerts.filter((alert: any) => 
      alert.severity === 'error' || alert.type === 'urgent-action'
    );
    riskIndicators += urgentAlerts.length;
  }
  
  // Check for suspicious activity
  if (visaCase.alerts && visaCase.alerts.some((alert: any) => 
    alert.type === 'deadline-warning' || alert.message.toLowerCase().includes('suspicious')
  )) {
    riskIndicators++;
  }
  
  // Check success probability
  if (successProbability < 40) riskIndicators += 2;
  else if (successProbability < 60) riskIndicators += 1;
  
  // Check for financial indicators
  if (visaCase.documents) {
    const financialDocs = visaCase.documents.filter((doc: any) => 
      doc.type.toLowerCase().includes('financial') && doc.uploaded
    );
    if (financialDocs.length === 0) {
      riskIndicators++; // No financial documentation increases risk
    }
  }
  
  // Determine risk level based on indicators
  if (riskIndicators >= 5) return 'critical';
  if (riskIndicators >= 3) return 'high';
  if (riskIndicators >= 1) return 'medium';
  return 'low';
};

// Helper function to detect duplicates
export const detectDuplicates = async (visaCase: any, currentCaseId?: string): Promise<boolean> => {
  try {
    // This would typically query the database for similar cases
    // For now, we'll simulate the functionality
    
    // In a real implementation, we would check for:
    // - Same passport number
    // - Similar name patterns
    // - Same email address
    // - Same phone number
    // - Same address information
    
    // Simulate checking against existing data
    // This would be replaced with actual database queries
    const hasSimilarPassport = visaCase.passportNumber && visaCase.passportNumber.length > 5;
    const hasSimilarName = visaCase.clientName && visaCase.clientName.length > 3;
    const hasSimilarEmail = visaCase.clientEmail && visaCase.clientEmail.includes('@');
    
    // For simulation purposes, return true if certain conditions are met
    // In reality, this would involve complex matching algorithms
    return (hasSimilarPassport || hasSimilarName || hasSimilarEmail) && Math.random() > 0.8;
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return false; // Default to false if there's an error
  }
};

// Helper function to determine priority level
export const determinePriority = (visaCase: any): 'normal' | 'urgent' | 'express' => {
  // Default to normal priority
  if (visaCase.priority === 'urgent') return 'urgent';
  if (visaCase.priority === 'express') return 'express';
  
  // Automatically assign priority based on certain criteria
  if (visaCase.expectedDecisionDate) {
    const expectedDate = new Date(visaCase.expectedDecisionDate);
    const currentDate = new Date();
    const timeDiff = expectedDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 7) return 'urgent';
    if (daysDiff <= 2) return 'express';
  }
  
  // Check for special circumstances that warrant higher priority
  if (visaCase.alerts && visaCase.alerts.some((alert: any) => 
    alert.type === 'urgent-action' || alert.severity === 'error'
  )) {
    return 'urgent';
  }
  
  return 'normal';
};

// Helper function to extract risk flags
export const extractRiskFlags = (visaCase: any, successProbability: number): string[] => {
  const riskFlags: string[] = [];
  
  // Check for incomplete documents
  if (visaCase.documents) {
    const requiredDocs = visaCase.documents.filter((doc: any) => doc.required);
    const uploadedDocs = visaCase.documents.filter((doc: any) => doc.uploaded);
    const missingDocs = requiredDocs.length - uploadedDocs.length;
    
    if (missingDocs > 0) {
      riskFlags.push(`${missingDocs} required document${missingDocs > 1 ? 's' : ''} missing`);
    }
  }
  
  // Check for alerts
  if (visaCase.alerts) {
    visaCase.alerts.forEach((alert: any) => {
      if (alert.severity === 'error' || alert.type === 'urgent-action') {
        riskFlags.push(alert.message);
      }
    });
  }
  
  // Add success probability warning if low
  if (successProbability < 50) {
    riskFlags.push(`Low success probability (${successProbability}%) - requires additional documentation`);
  }
  
  // Check for previous denials
  if (visaCase.alerts && visaCase.alerts.some((alert: any) => 
    alert.message.toLowerCase().includes('denied') || alert.message.toLowerCase().includes('rejected')
  )) {
    riskFlags.push('Previous visa denial detected');
  }
  
  // Check for financial indicators
  if (visaCase.documents) {
    const financialDocs = visaCase.documents.filter((doc: any) => 
      doc.type.toLowerCase().includes('financial') && doc.uploaded
    );
    if (financialDocs.length === 0) {
      riskFlags.push('No financial documentation provided');
    }
  }
  
  // Check for travel history
  if (!visaCase.travelHistory || visaCase.travelHistory.length === 0) {
    riskFlags.push('No previous travel history documented');
  }
  
  return riskFlags;
};

// Helper function to generate recommendations based on risk flags
export const generateRecommendations = (riskFlags: string[]): { improvements: string[], strengths: string[] } => {
  const improvements: string[] = [];
  const strengths: string[] = [];

  // Analyze risk flags to generate improvement suggestions
  if (riskFlags.some(flag => flag.toLowerCase().includes('missing'))) {
    improvements.push('Provide all required documentation to support application');
  }
  
  if (riskFlags.some(flag => flag.toLowerCase().includes('financial'))) {
    improvements.push('Include stronger financial documentation (bank statements, employment letter)');
  }
  
  if (riskFlags.some(flag => flag.toLowerCase().includes('probability'))) {
    improvements.push('Consider applying for alternative visa category if eligible');
  }
  
  if (riskFlags.some(flag => flag.toLowerCase().includes('denial'))) {
    improvements.push('Address issues from previous application before reapplying');
  }

  // Add default strengths if no critical issues are found
  if (riskFlags.length === 0) {
    strengths.push('Application appears complete and well-documented');
    strengths.push('Strong supporting documentation provided');
  } else {
    // Identify potential strengths despite issues
    if (riskFlags.length < 3) {
      strengths.push('Application has more strengths than critical issues');
    }
  }

  return { improvements, strengths };
};