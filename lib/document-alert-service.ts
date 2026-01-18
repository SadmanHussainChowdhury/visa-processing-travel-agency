import { dbConnect } from './db';
import Document from '@/models/Document';
import Client from '@/models/Client';
import DocumentAlert from '@/models/DocumentAlert';
import VisaCase from '@/models/VisaCase';

interface RequiredDocument {
  category: string;
  name: string;
}

function getRequiredDocumentsForVisaType(visaType: string): RequiredDocument[] {
  // Define required documents based on visa type
  const requiredDocsMap: Record<string, RequiredDocument[]> = {
    'tourist': [
      { category: 'passport', name: 'Passport' },
      { category: 'photo', name: 'Passport Photo' },
      { category: 'financial', name: 'Bank Statements' },
      { category: 'application', name: 'Application Form' },
    ],
    'business': [
      { category: 'passport', name: 'Passport' },
      { category: 'photo', name: 'Passport Photo' },
      { category: 'financial', name: 'Business Registration' },
      { category: 'invitation', name: 'Invitation Letter' },
      { category: 'application', name: 'Application Form' },
    ],
    'student': [
      { category: 'passport', name: 'Passport' },
      { category: 'photo', name: 'Passport Photo' },
      { category: 'financial', name: 'Bank Statements' },
      { category: 'acceptance', name: 'University Acceptance Letter' },
      { category: 'application', name: 'Application Form' },
    ],
    'work': [
      { category: 'passport', name: 'Passport' },
      { category: 'photo', name: 'Passport Photo' },
      { category: 'employment', name: 'Employment Contract' },
      { category: 'qualification', name: 'Professional Qualifications' },
      { category: 'application', name: 'Application Form' },
    ],
    // Default required documents for any other visa type
    'default': [
      { category: 'passport', name: 'Passport' },
      { category: 'photo', name: 'Passport Photo' },
      { category: 'application', name: 'Application Form' },
    ]
  };
  
  return requiredDocsMap[visaType.toLowerCase()] || requiredDocsMap['default'];
}

export interface DocumentAlertData {
  clientId: string;
  clientName: string;
  documentType: string;
  documentId: string;
  alertType: 'missing' | 'expiring' | 'expired';
  message: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  expirationDate?: Date;
}

export async function generateDocumentAlerts(): Promise<DocumentAlertData[]> {
  await dbConnect();
  
  // Get all documents
  const documents = await Document.find({});
  
  // Get all clients to cross-reference
  const clients = await Client.find({});
  
  const alerts: DocumentAlertData[] = [];
  
  // Check for expiring/expired documents
  const today = new Date();
  const soonDate = new Date();
  soonDate.setDate(today.getDate() + 7); // 7 days from now
  
  for (const document of documents) {
    if (document.expiryDate) {
      const expiryDate = new Date(document.expiryDate);
      
      // Check for expired documents
      if (expiryDate < today) {
        const client = clients.find(c => c._id.toString() === document.clientId);
        
        alerts.push({
          clientId: document.clientId || '',
          clientName: document.clientName || (client ? client.name : 'Unknown'),
          documentType: document.category,
          documentId: document.documentId,
          alertType: 'expired',
          message: `Document "${document.fileName}" has expired on ${expiryDate.toLocaleDateString()}`,
          priority: 'high',
          dueDate: expiryDate,
          expirationDate: expiryDate
        });
      }
      // Check for documents expiring soon (within 7 days)
      else if (expiryDate <= soonDate) {
        const client = clients.find(c => c._id.toString() === document.clientId);
        
        alerts.push({
          clientId: document.clientId || '',
          clientName: document.clientName || (client ? client.name : 'Unknown'),
          documentType: document.category,
          documentId: document.documentId,
          alertType: 'expiring',
          message: `Document "${document.fileName}" expires on ${expiryDate.toLocaleDateString()}`,
          priority: 'medium',
          dueDate: expiryDate,
          expirationDate: expiryDate
        });
      }
    }
  }
  
  // Check for missing documents based on visa cases
  // We'll need to look at visa case requirements and compare with actual documents
  // First, get all visa cases and clients separately
  try {
    const visaCases = await VisaCase.find({});
    const allClients = await Client.find({});
    
    for (const visaCase of visaCases) {
      // Get client information
      const clientInfo = allClients.find(client => client._id.toString() === visaCase.clientId);
      
      // Get all documents for this client/visa case
      const caseDocuments = documents.filter(doc => 
        doc.clientId === visaCase.clientId || 
        doc.visaCaseId === visaCase.caseId
      );
      
      // Check for standard required documents based on visa type
      const requiredDocs = getRequiredDocumentsForVisaType(visaCase.visaType);
      
      for (const requiredDoc of requiredDocs) {
        const hasDocument = caseDocuments.some(doc => 
          doc.category === requiredDoc.category && 
          doc.status !== 'rejected'
        );
        
        if (!hasDocument) {
          alerts.push({
            clientId: visaCase.clientId,
            clientName: clientInfo?.name || visaCase.clientName,
            documentType: requiredDoc.category,
            documentId: `MISSING-${visaCase.caseId}-${requiredDoc.category}`,
            alertType: 'missing',
            message: `Required document '${requiredDoc.name}' is missing for visa case ${visaCase.caseId}`,
            priority: 'high',
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking for missing documents:', error);
    // Continue with just expiry alerts if visa cases aren't available
  }
  
  return alerts;
}

export async function createDocumentAlertsFromService() {
  const alerts = await generateDocumentAlerts();
  
  for (const alertData of alerts) {
    // Check if an alert already exists for this document and type
    const existingAlert = await DocumentAlert.findOne({
      documentId: alertData.documentId,
      alertType: alertData.alertType,
      status: 'active'
    });
    
    if (!existingAlert) {
      const newAlert = new DocumentAlert({
        clientId: alertData.clientId,
        documentType: alertData.documentType,
        documentId: alertData.documentId,
        alertType: alertData.alertType,
        message: alertData.message,
        priority: alertData.priority,
        status: 'active',
        dueDate: alertData.dueDate,
        expirationDate: alertData.expirationDate,
      });
      
      await newAlert.save();
    }
  }
  
  return alerts;
}

export async function checkAndGenerateDocumentAlerts() {
  try {
    // Generate alerts from documents
    const alerts = await createDocumentAlertsFromService();
    
    // Log the results
    console.log(`Generated ${alerts.length} document alerts from document management data.`);
    
    return alerts;
  } catch (error) {
    console.error('Error generating document alerts:', error);
    throw error;
  }
}