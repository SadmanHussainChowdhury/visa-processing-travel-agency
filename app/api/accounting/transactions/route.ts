import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    
    // Transaction feature has been removed
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Transaction feature has been removed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Transaction feature has been removed
    return NextResponse.json(
      { error: 'Transaction feature has been removed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling transaction request:', error);
    return NextResponse.json(
      { error: 'Transaction feature has been removed' },
      { status: 500 }
    );
  }
}