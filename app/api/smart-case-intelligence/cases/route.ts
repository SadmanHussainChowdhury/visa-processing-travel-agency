import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import VisaCase from '@/models/VisaCase';
import Client from '@/models/Client';
import { 
  calculateSuccessProbability, 
  determineRiskLevel, 
  detectDuplicates, 
  determinePriority,
  extractRiskFlags,
  generateRecommendations
} from '../helpers/calculateIntelligence';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all visa cases with client information
    const visaCases = await VisaCase.find({})
      .populate('clientId', 'name email passportNumber')
      .sort({ createdAt: -1 });

    // Transform the cases to the format expected by the frontend
    const transformedCases = await Promise.all(visaCases.map(async (visaCase) => {
      const successProbability = calculateSuccessProbability(visaCase);
      const riskLevel = determineRiskLevel(visaCase, successProbability);
      const duplicateDetected = await detectDuplicates(visaCase);
      const priority = determinePriority(visaCase);
      
      // Extract risk flags using helper function
      const riskFlags = extractRiskFlags(visaCase, successProbability);

      return {
        id: visaCase._id.toString(),
        caseId: visaCase.caseId || `VC-${visaCase._id.toString().substring(0, 8).toUpperCase()}`,
        clientName: visaCase.clientName || (visaCase.clientId as any)?.name || 'Unknown Client',
        visaType: visaCase.visaType || 'Unknown',
        country: visaCase.country || 'Unknown',
        successProbability,
        riskLevel,
        duplicateDetected,
        priority,
        riskFlags,
        createdAt: visaCase.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: visaCase.updatedAt?.toISOString() || new Date().toISOString()
      };
    }));

    return NextResponse.json(transformedCases);
  } catch (error) {
    console.error('Error fetching case intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case intelligence' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.clientId || !body.visaType || !body.country) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, visaType, country' },
        { status: 400 }
      );
    }

    // Create new case
    const newCase = new VisaCase({
      clientId: body.clientId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      visaType: body.visaType,
      country: body.country,
      status: body.status || 'draft',
      submissionDate: body.submissionDate,
      applicationDate: body.applicationDate || new Date(),
      expectedDecisionDate: body.expectedDecisionDate,
      priority: body.priority || 'medium',
      documents: body.documents || [],
      checklistItems: body.checklistItems || [],
      notes: body.notes || [],
      reminders: body.reminders || [],
      alerts: body.alerts || []
    });

    await newCase.save();

    // Calculate intelligence metrics for the new case
    const successProbability = calculateSuccessProbability(newCase);
    const riskLevel = determineRiskLevel(newCase, successProbability);
    const duplicateDetected = await detectDuplicates(newCase);
    const priority = determinePriority(newCase);
    
    // Extract risk flags using helper function
    const riskFlags = extractRiskFlags(newCase, successProbability);

    const transformedCase = {
      id: newCase._id.toString(),
      caseId: newCase.caseId || `VC-${newCase._id.toString().substring(0, 8).toUpperCase()}`,
      clientName: newCase.clientName || (newCase.clientId as any)?.name || 'Unknown Client',
      visaType: newCase.visaType || 'Unknown',
      country: newCase.country || 'Unknown',
      successProbability,
      riskLevel,
      duplicateDetected,
      priority,
      riskFlags,
      createdAt: newCase.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: newCase.updatedAt?.toISOString() || new Date().toISOString()
    };

    return NextResponse.json(transformedCase, { status: 201 });
  } catch (error) {
    console.error('Error creating case intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to create case intelligence' },
      { status: 500 }
    );
  }
}