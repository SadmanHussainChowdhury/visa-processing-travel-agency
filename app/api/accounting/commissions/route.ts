import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Commission from '@/models/Commission';

export async function GET() {
  try {
    await dbConnect();
    
    const commissions = await Commission.find({})
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 commissions
    
    return NextResponse.json(commissions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.agentId || !body.agentName || !body.period || !body.commissionRate) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, agentName, period, commissionRate' },
        { status: 400 }
      );
    }
    
    // Validate commission rate
    if (body.commissionRate < 0 || body.commissionRate > 100) {
      return NextResponse.json(
        { error: 'Commission rate must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    // Calculate commission earned if not provided
    let commissionEarned = body.commissionEarned;
    if (!commissionEarned && body.totalAmount && body.commissionRate) {
      commissionEarned = (body.totalAmount * body.commissionRate) / 100;
    }
    
    // Create new commission record
    const newCommission = new Commission({
      agentId: body.agentId,
      agentName: body.agentName,
      period: body.period,
      transactionsCount: body.transactionsCount || 0,
      totalAmount: body.totalAmount || 0,
      commissionRate: body.commissionRate,
      commissionEarned: commissionEarned || 0,
      status: body.status || 'pending',
      paymentDate: body.paymentDate,
      notes: body.notes || ''
    });
    
    await newCommission.save();
    
    return NextResponse.json(newCommission, { status: 201 });
  } catch (error) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { error: 'Failed to create commission' },
      { status: 500 }
    );
  }
}