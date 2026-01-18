import { dbConnect } from './db';
import Client from '@/models/Client';
import VisaCase from '@/models/VisaCase';

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
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Country</th>
              <th>Passport Number</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    clients.forEach(client => {
      htmlContent += `
        <tr>
          <td>${client._id || ''}</td>
          <td>${client.name || ''}</td>
          <td>${client.email || ''}</td>
          <td>${client.phone || ''}</td>
          <td>${client.country || ''}</td>
          <td>${client.passportNumber || ''}</td>
          <td>${client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : ''}</td>
          <td>${client.gender || ''}</td>
          <td>${client.status || ''}</td>
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

// Function to generate PDF for applications data
export async function generateApplicationsPdf(format: string = 'json') {
  await dbConnect();

  // Fetch all visa cases (applications)
  const applications = await VisaCase.find({})
    .populate('clientId', 'name email phone')
    .sort({ createdAt: -1 });

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
          <td>${application.clientId?.phone || ''}</td>
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