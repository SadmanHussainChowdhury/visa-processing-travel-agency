import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect from patients to clients
  return NextResponse.json({ 
    error: 'Patient API has been deprecated', 
    redirect: '/api/clients/search',
    message: 'Use the /api/clients/search endpoint instead'
  }, { status: 301 });
}
