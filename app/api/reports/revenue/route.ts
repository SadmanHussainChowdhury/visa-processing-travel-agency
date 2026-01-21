import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Payment & Billing feature has been removed from the application
    return NextResponse.json({
      error: 'Revenue reports are no longer available as Payment & Billing feature has been removed',
      status: 'unavailable'
    }, { status: 404 });
  } catch (error) {
    console.error('Error handling revenue report request:', error);
    return NextResponse.json(
      { error: 'Revenue reporting service is unavailable' },
      { status: 500 }
    );
  }
}