import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VisaCase from '@/models/VisaCase';
import { getStandardDocuments, getChecklistItems, getStandardReminders } from '@/lib/visa-documents';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const search = searchParams.get('search');
    
    let query: any = {};
    
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } },
        { visaType: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }
    
    const visaCases = await VisaCase.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(visaCases);
  } catch (error) {
    console.error('Error fetching visa cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Generate standard documents based on visa type
    const standardDocs = getStandardDocuments(body.visaType);
    
    // Generate standard checklists based on visa type
    const standardChecklists = getChecklistItems(body.visaType);
    
    // Generate standard reminders based on visa type
    const standardReminders = getStandardReminders(body.visaType);
    
    // Generate case ID
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const caseId = `VC-${year}-${randomNum}`;
    
    const visaCaseData = {
      ...body,
      caseId,
      documents: standardDocs,
      checklistItems: standardChecklists,
      reminders: standardReminders,
      alerts: [], // Start with no alerts
      applicationDate: new Date()
    };
    
    const visaCase = new VisaCase(visaCaseData);
    await visaCase.save();
    
    return NextResponse.json(visaCase, { status: 201 });
  } catch (error) {
    console.error('Error creating visa case:', error);
    return NextResponse.json(
      { error: 'Failed to create visa case' },
      { status: 500 }
    );
  }
}