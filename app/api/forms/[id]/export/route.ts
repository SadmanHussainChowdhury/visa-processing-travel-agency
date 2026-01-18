import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const template = await FormTemplate.findById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Form template not found' },
        { status: 404 }
      );
    }
    
    // Get the format from query parameters (html or txt)
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'txt';
    
    let content: string;
    let contentType: string;
    let fileName: string;
    
    if (format === 'html') {
      // Generate HTML content that can be saved as PDF
      content = generateFormTemplateHTML(template);
      contentType = 'text/html';
      fileName = `${template.name.replace(/[^a-zA-Z0-9-_]/g, '_')}_template.html`;
    } else {
      // Default to text format
      content = generateFormTemplateText(template);
      contentType = 'text/plain';
      fileName = `${template.name.replace(/[^a-zA-Z0-9-_]/g, '_')}_template.txt`;
    }
    
    const response = new NextResponse(content);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return response;
  } catch (error) {
    console.error('Error exporting form template:', error);
    return NextResponse.json(
      { error: 'Failed to export form template' },
      { status: 500 }
    );
  }
}

function generateFormTemplateText(template: any): string {
  let content = `FORM TEMPLATE: ${template.name}\n`;
  content += `Country: ${template.country}\n`;
  content += `Category: ${template.category}\n`;
  content += `Version: ${template.version}\n`;
  content += `Status: ${template.status}\n`;
  if (template.description) {
    content += `Description: ${template.description}\n`;
  }
  content += `\n`;
  
  content += 'FORM FIELDS:\n';
  template.fields.forEach((field: any, index: number) => {
    content += `${index + 1}. ${field.label} (${field.type})`;
    if (field.required) content += ' *';
    content += '\n';
    
    if (field.placeholder) {
      content += `   Placeholder: ${field.placeholder}\n`;
    }
    
    if (field.options && field.options.length > 0) {
      content += `   Options: ${field.options.join(', ')}\n`;
    }
    
    content += '\n';
  });
  
  return content;
}

function generateFormTemplateHTML(template: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${template.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .field { margin-bottom: 10px; padding: 5px; border: 1px solid #ccc; }
    .required { color: red; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${template.name}</h1>
    <p><strong>Country:</strong> ${template.country}</p>
    <p><strong>Category:</strong> ${template.category}</p>
    <p><strong>Version:</strong> ${template.version}</p>
    <p><strong>Status:</strong> ${template.status}</p>
    ${template.description ? `<p><strong>Description:</strong> ${template.description}</p>` : ''}
  </div>
  
  <div class="section">
    <h2>Form Fields</h2>
    ${
      template.fields.map((field: any, index: number) => `
        <div class="field">
          <strong>${index + 1}. ${field.label}${field.required ? '<span class="required"> *</span>' : ''}</strong> (${field.type})
          ${field.placeholder ? `<br><em>Placeholder:</em> ${field.placeholder}` : ''}
          ${field.options && field.options.length > 0 ? `<br><em>Options:</em> ${field.options.join(', ')}` : ''}
        </div>
      `).join('')
    }
  </div>
</body>
</html>`;
}