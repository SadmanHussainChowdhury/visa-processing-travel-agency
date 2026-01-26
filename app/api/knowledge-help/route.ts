import { NextRequest } from 'next/server';
import { VisaKnowledge, SOPDocument, LearningGuideline, RejectionTip } from '../../../models/KnowledgeBase';
import { dbConnect } from '../../../lib/db';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'visa-knowledge') {
      const entries = await VisaKnowledge.find({});
      return Response.json(entries);
    } else if (type === 'sop-docs') {
      const docs = await SOPDocument.find({});
      return Response.json(docs);
    } else if (type === 'learning-guidelines') {
      const guidelines = await LearningGuideline.find({});
      return Response.json(guidelines);
    } else if (type === 'rejection-tips') {
      const tips = await RejectionTip.find({});
      return Response.json(tips);
    }

    // Return all data if no specific type requested
    const visaKnowledge = await VisaKnowledge.find({});
    const sopDocs = await SOPDocument.find({});
    const learningGuidelines = await LearningGuideline.find({});
    const rejectionTips = await RejectionTip.find({});
    
    return Response.json({
      visaKnowledge,
      sopDocs,
      learningGuidelines,
      rejectionTips
    });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  const data = await request.json();
  const { type } = data;

  try {
    if (type === 'visa-knowledge') {
      const newEntry = new VisaKnowledge(data.entry);
      await newEntry.save();
      return Response.json(newEntry, { status: 201 });
    } else if (type === 'sop-docs') {
      const newDoc = new SOPDocument(data.doc);
      await newDoc.save();
      return Response.json(newDoc, { status: 201 });
    } else if (type === 'learning-guidelines') {
      const newGuideline = new LearningGuideline(data.guideline);
      await newGuideline.save();
      return Response.json(newGuideline, { status: 201 });
    } else if (type === 'rejection-tips') {
      const newTip = new RejectionTip(data.tip);
      await newTip.save();
      return Response.json(newTip, { status: 201 });
    }

    return Response.json({ message: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  const data = await request.json();
  const { type, id } = data;

  try {
    if (type === 'visa-knowledge') {
      const updatedEntry = await VisaKnowledge.findByIdAndUpdate(
        id,
        { ...data.entry, lastUpdated: new Date() },
        { new: true }
      );
      if (!updatedEntry) {
        return Response.json({ message: 'Entry not found' }, { status: 404 });
      }
      return Response.json(updatedEntry);
    } else if (type === 'sop-docs') {
      const updatedDoc = await SOPDocument.findByIdAndUpdate(
        id,
        { ...data.doc, lastUpdated: new Date() },
        { new: true }
      );
      if (!updatedDoc) {
        return Response.json({ message: 'Document not found' }, { status: 404 });
      }
      return Response.json(updatedDoc);
    } else if (type === 'learning-guidelines') {
      const updatedGuideline = await LearningGuideline.findByIdAndUpdate(
        id,
        data.guideline,
        { new: true }
      );
      if (!updatedGuideline) {
        return Response.json({ message: 'Guideline not found' }, { status: 404 });
      }
      return Response.json(updatedGuideline);
    } else if (type === 'rejection-tips') {
      const updatedTip = await RejectionTip.findByIdAndUpdate(
        id,
        data.tip,
        { new: true }
      );
      if (!updatedTip) {
        return Response.json({ message: 'Tip not found' }, { status: 404 });
      }
      return Response.json(updatedTip);
    }

    return Response.json({ message: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  try {
    if (type === 'visa-knowledge') {
      const result = await VisaKnowledge.findByIdAndDelete(id);
      if (!result) {
        return Response.json({ message: 'Entry not found' }, { status: 404 });
      }
      return Response.json({ message: 'Entry deleted' });
    } else if (type === 'sop-docs') {
      const result = await SOPDocument.findByIdAndDelete(id);
      if (!result) {
        return Response.json({ message: 'Document not found' }, { status: 404 });
      }
      return Response.json({ message: 'Document deleted' });
    } else if (type === 'learning-guidelines') {
      const result = await LearningGuideline.findByIdAndDelete(id);
      if (!result) {
        return Response.json({ message: 'Guideline not found' }, { status: 404 });
      }
      return Response.json({ message: 'Guideline deleted' });
    } else if (type === 'rejection-tips') {
      const result = await RejectionTip.findByIdAndDelete(id);
      if (!result) {
        return Response.json({ message: 'Tip not found' }, { status: 404 });
      }
      return Response.json({ message: 'Tip deleted' });
    }

    return Response.json({ message: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}