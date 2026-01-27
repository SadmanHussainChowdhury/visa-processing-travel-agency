import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function GET() {
  // Redirect from patients to clients
  return NextResponse.json({ 
    error: 'Patient API has been deprecated', 
    redirect: '/api/clients',
    message: 'Use the /api/clients endpoint instead'
  }, { status: 301 });
}

export async function POST(request: NextRequest) {
  // Redirect from patients to clients
  return NextResponse.json({ 
    error: 'Patient API has been deprecated', 
    redirect: '/api/clients',
    message: 'Use the /api/clients endpoint instead'
  }, { status: 301 });
}
