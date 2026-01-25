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
} from '../../helpers/calculateIntelligence';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { id } = params;

    // Get specific visa case with client information
    const visaCase = await VisaCase.findById(id)
      .populate('clientId', 'name email passportNumber')
      .exec();

    if (!visaCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Calculate intelligence metrics for the case
    const successProbability = calculateSuccessProbability(visaCase);
    const riskLevel = determineRiskLevel(visaCase, successProbability);
    const duplicateDetected = await detectDuplicates(visaCase);
    const priority = determinePriority(visaCase);
    
    // Extract risk flags using helper function
    const riskFlags = extractRiskFlags(visaCase, successProbability);
    
    // Generate recommendations based on risk flags
    const recommendations = generateRecommendations(riskFlags);

    // Transform the case to the format expected by the frontend
    const transformedCase = {
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
      recommendations,
      createdAt: visaCase.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: visaCase.updatedAt?.toISOString() || new Date().toISOString()
    };

    return NextResponse.json(transformedCase);
  } catch (error) {
    console.error('Error fetching case intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case intelligence' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Find the visa case by ID
    const visaCase = await VisaCase.findById(id);
    if (!visaCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Update the case with new data
    const updatedCase = await VisaCase.findByIdAndUpdate(
      id,
      {
        $set: {
          status: body.status || visaCase.status,
          submissionDate: body.submissionDate || visaCase.submissionDate,
          documents: body.documents || visaCase.documents,
          checklistItems: body.checklistItems || visaCase.checklistItems,
          notes: body.notes || visaCase.notes,
          reminders: body.reminders || visaCase.reminders,
          alerts: body.alerts || visaCase.alerts,
          priority: body.priority || visaCase.priority,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate('clientId', 'name email passportNumber');

    // Calculate intelligence metrics for the updated case
    const successProbability = calculateSuccessProbability(updatedCase);
    const riskLevel = determineRiskLevel(updatedCase, successProbability);
    const duplicateDetected = await detectDuplicates(updatedCase);
    const priority = determinePriority(updatedCase);
    
    // Extract risk flags using helper function
    const riskFlags = extractRiskFlags(updatedCase, successProbability);
    
    // Generate recommendations based on risk flags
    const recommendations = generateRecommendations(riskFlags);

    // Transform the updated case to the format expected by the frontend
    const transformedCase = {
      id: updatedCase._id.toString(),
      caseId: updatedCase.caseId || `VC-${updatedCase._id.toString().substring(0, 8).toUpperCase()}`,
      clientName: updatedCase.clientName || (updatedCase.clientId as any)?.name || 'Unknown Client',
      visaType: updatedCase.visaType || 'Unknown',
      country: updatedCase.country || 'Unknown',
      successProbability,
      riskLevel,
      duplicateDetected,
      priority,
      riskFlags,
      recommendations,
      createdAt: updatedCase.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: updatedCase.updatedAt?.toISOString() || new Date().toISOString()
    };

    return NextResponse.json(transformedCase);
  } catch (error) {
    console.error('Error updating case intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to update case intelligence' },
      { status: 500 }
    );
  }
}