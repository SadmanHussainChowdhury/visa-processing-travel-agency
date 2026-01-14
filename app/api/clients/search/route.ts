import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Extract query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const limitParam = url.searchParams.get('limit');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }
    
    const limit = limitParam ? parseInt(limitParam) : 10;
    
    // Search for clients by name (firstName or lastName)
    const regex = new RegExp(query, 'i'); // Case insensitive search
    const clients = await Client.find({
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    }).limit(limit);
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error searching clients:', error);
    return NextResponse.json(
      { error: 'Failed to search clients' },
      { status: 500 }
    );
  }
}