import { dbConnect } from './db';
import Client from '@/models/Client';
import VisaCase from '@/models/VisaCase';
import Commission from '@/models/Commission';
import DocModel from '@/models/Document';

// Function to generate PDF for clients data
export async function generateClientsPdf(format: string = 'json') {
  await dbConnect();

  // Fetch all clients
  const clients = await Client.find({}).sort({ createdAt: -1 });

  if (format === 'pdf') {
    // For PDF generation, we'll return HTML content that can be converted to PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clients Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Clients Report</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Passport Country</th>
              <th>Passport Number</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Visa Type</th>
            </tr>
          </thead>
          <tbody>
    `;

    clients.forEach(client => {
      htmlContent += `
        <tr>
          <td>${client.clientId || client._id || ''}</td>
          <td>${client.firstName || ''}</td>
          <td>${client.lastName || ''}</td>
          <td>${client.email || ''}</td>
          <td>${client.phone || ''}</td>
          <td>${client.passportCountry || ''}</td>
          <td>${client.passportNumber || ''}</td>
          <td>${client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : ''}</td>
          <td>${client.gender || ''}</td>
          <td>${client.visaType || ''}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    return htmlContent;
  } else {
    // Return JSON data
    return clients;
  }
}

// Function to generate PDF for documents data
export async function generateDocumentsPdf(format: string = 'json') {
  await dbConnect();

  // Fetch all documents
  const documents = await DocModel.find({}).sort({ createdAt: -1 });

  if (format === 'pdf') {
    // For PDF generation, we'll return HTML content that can be converted to PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Documents Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Documents Report</h1>
        <table>
          <thead>
            <tr>
              <th>Document ID</th>
              <th>File Name</th>
              <th>Original Name</th>
              <th>File Type</th>
              <th>File Size</th>
              <th>Client Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Uploaded At</th>
            </tr>
          </thead>
          <tbody>
    `;

    documents.forEach((document: any) => {
      htmlContent += `
        <tr>
          <td>${document.documentId || ''}</td>
          <td>${document.fileName || ''}</td>
          <td>${document.originalName || ''}</td>
          <td>${document.fileType || ''}</td>
          <td>${document.fileSize || ''}</td>
          <td>${document.clientName || ''}</td>
          <td>${document.category || ''}</td>
          <td>${document.status || ''}</td>
          <td>${document.uploadedAt ? new Date(document.uploadedAt).toISOString().split('T')[0] : ''}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    return htmlContent;
  } else {
    // Return JSON data
    return documents;
  }
}

// Function to generate PDF for applications data
export async function generateApplicationsPdf(format: string = 'json') {
  await dbConnect();

  // Fetch all visa cases (applications)
  const applications = await VisaCase.find({}).sort({ createdAt: -1 });
  const clientIds = applications
    .map((application: any) => application.clientId)
    .filter(Boolean);
  const clients = clientIds.length
    ? await Client.find({ _id: { $in: clientIds } }).select('phone')
    : [];
  const clientPhoneMap = new Map(
    clients.map((client: any) => [client._id.toString(), client.phone])
  );

  if (format === 'pdf') {
    // For PDF generation, we'll return HTML content that can be converted to PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Applications Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Applications Report</h1>
        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Client Name</th>
              <th>Client Email</th>
              <th>Client Phone</th>
              <th>Visa Type</th>
              <th>Country</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Application Date</th>
            </tr>
          </thead>
          <tbody>
    `;

    applications.forEach(application => {
      htmlContent += `
        <tr>
          <td>${application.caseId || ''}</td>
          <td>${application.clientName || ''}</td>
          <td>${application.clientEmail || ''}</td>
          <td>${clientPhoneMap.get(String(application.clientId)) || ''}</td>
          <td>${application.visaType || ''}</td>
          <td>${application.country || ''}</td>
          <td>${application.status || ''}</td>
          <td>${application.priority || ''}</td>
          <td>${application.applicationDate ? new Date(application.applicationDate).toISOString().split('T')[0] : ''}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    return htmlContent;
  } else {
    // Return JSON data
    return applications;
  }
}

