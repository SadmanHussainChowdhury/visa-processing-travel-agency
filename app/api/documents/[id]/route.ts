import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const document = await Document.findById(params.id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();

    // If document is being updated, create a new version if content changed
    const existingDoc = await Document.findById(params.id);
    if (existingDoc) {
      // Check if this is a significant update that warrants versioning
      const shouldCreateVersion = body.fileName || body.filePath || body.url;
      
      if (shouldCreateVersion) {
        // Save previous version
        existingDoc.previousVersions.push({
          version: existingDoc.version,
          fileName: existingDoc.fileName,
          filePath: existingDoc.filePath,
          uploadedAt: existingDoc.updatedAt,
          uploadedBy: existingDoc.uploadedBy
        });
        existingDoc.version += 1;
        await existingDoc.save();
      }
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const deletedDocument = await Document.findByIdAndDelete(params.id);

    if (!deletedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}