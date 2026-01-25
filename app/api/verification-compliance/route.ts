import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Verification from '@/models/Verification';
import Client from '@/models/Client';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const verificationType = searchParams.get('verificationType');
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');

    // Build query based on filters
    const query: any = {};
    if (clientId) query.clientId = clientId;
    if (verificationType) query.verificationType = verificationType;
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;

    const verifications = await Verification.find(query)
      .populate('clientId', 'firstName lastName email phone')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.clientId || !body.verificationType || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, verificationType, method' },
        { status: 400 }
      );
    }

    // Check if client exists
    const client = await Client.findById(body.clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create new verification
    const newVerification = new Verification({
      clientId: body.clientId,
      verificationType: body.verificationType,
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
    await newVerification.populate('clientId', 'firstName lastName email phone');
    await newVerification.populate('verifiedBy', 'name email');

    return NextResponse.json(newVerification, { status: 201 });
  } catch (error) {
    console.error('Error creating verification:', error);
    return NextResponse.json(
      { error: 'Failed to create verification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update verification
    const updatedVerification = await Verification.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('clientId', 'firstName lastName email phone')
      .populate('verifiedBy', 'name email');

    if (!updatedVerification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVerification);
  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json(
      { error: 'Failed to update verification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      );
    }

    const deletedVerification = await Verification.findByIdAndDelete(id);

    if (!deletedVerification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Verification deleted successfully' });
  } catch (error) {
    console.error('Error deleting verification:', error);
    return NextResponse.json(
      { error: 'Failed to delete verification' },
      { status: 500 }
    );
  }
}