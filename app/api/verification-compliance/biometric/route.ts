import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Verification from '@/models/Verification';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    // Build query for biometric verifications only
    const query: any = { verificationType: 'biometric' };
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;

    const verifications = await Verification.find(query)
      .populate('clientId', 'name email phone')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error('Error fetching biometric verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch biometric verifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields for biometric verification
    if (!body.clientId || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, method' },
        { status: 400 }
      );
    }

    // Create new biometric verification
    const newVerification = new Verification({
      clientId: body.clientId,
      verificationType: 'biometric',
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
    console.error('Error creating biometric verification:', error);
    return NextResponse.json(
      { error: 'Failed to create biometric verification' },
      { status: 500 }
    );
  }
}