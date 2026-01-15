import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const visaCaseId = searchParams.get('visaCaseId');
    
    let query: any = {};
    
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (clientId) query.clientId = clientId;
    if (visaCaseId) query.visaCaseId = visaCaseId;
    
    const documents = await Document.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Generate document ID
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const documentId = `DOC-${year}-${randomNum}`;
    
    const documentData = {
      ...body,
      documentId,
      uploadedAt: new Date(),
      version: 1
    };
    
    const document = new Document(documentData);
    await document.save();
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}