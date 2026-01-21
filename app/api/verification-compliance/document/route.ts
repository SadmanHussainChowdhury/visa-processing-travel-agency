import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Verification from '@/models/Verification';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    // Build query for document verifications only
    const query: any = { verificationType: 'document' };
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;

    const verifications = await Verification.find(query)
      .populate('clientId', 'name email phone')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error('Error fetching document verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document verifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields for document verification
    if (!body.clientId || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, method' },
        { status: 400 }
      );
    }

    // Create new document verification
    const newVerification = new Verification({
      clientId: body.clientId,
      verificationType: 'document',
      status: body.status || 'pending',
      method: body.method,
      result: body.result || {},
      riskLevel: body.riskLevel || 'low',
      notes: body.notes || '',
      verifiedBy: body.verifiedBy,
      expiryDate: body.expiryDate
    });

    await newVerification.save();

    // Populate the saved verification for response
    await newVerification.populate('clientId', 'name email phone');
    await newVerification.populate('verifiedBy', 'name email');

    return NextResponse.json(newVerification, { status: 201 });
  } catch (error) {
    console.error('Error creating document verification:', error);
    return NextResponse.json(
      { error: 'Failed to create document verification' },
      { status: 500 }
    );
  }
}