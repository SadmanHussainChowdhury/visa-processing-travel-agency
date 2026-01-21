import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Verification from '@/models/Verification';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    // Build query for identity verifications only
    const query: any = { verificationType: 'identity' };
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;

    const verifications = await Verification.find(query)
      .populate('clientId', 'name email phone')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error('Error fetching identity verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch identity verifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields for identity verification
    if (!body.clientId || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, method' },
        { status: 400 }
      );
    }

    // Create new identity verification
    const newVerification = new Verification({
      clientId: body.clientId,
      verificationType: 'identity',
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
    console.error('Error creating identity verification:', error);
    return NextResponse.json(
      { error: 'Failed to create identity verification' },
      { status: 500 }
    );
  }
}