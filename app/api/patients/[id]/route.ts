import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect from patients to clients
  return NextResponse.json({ 
    error: 'Patient API has been deprecated', 
    redirect: `/api/clients/${params.id}`,
    message: 'Use the /api/clients/{id} endpoint instead'
  }, { status: 301 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect from patients to clients
  return NextResponse.json({ 
    error: 'Patient API has been deprecated', 
    redirect: `/api/clients/${params.id}`,
    message: 'Use the /api/clients/{id} endpoint instead'
  }, { status: 301 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect from patients to clients
  return NextResponse.json({ 
    error: 'Patient API has been deprecated', 
    redirect: `/api/clients/${params.id}`,
    message: 'Use the /api/clients/{id} endpoint instead'
  }, { status: 301 });
}