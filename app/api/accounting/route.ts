import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VisaApplication from '@/models/VisaApplication';
import Commission from '@/models/Commission';

interface Transaction {
  id: string;
  description: string;
  client: string;
  amount: number;
  type: 'revenue' | 'expense';
  category: string;
  date: string;
}

export async function GET() {
  try {
    await dbConnect();
    
    // Get all applications to calculate revenue
    const applications = await VisaApplication.find({}).populate('clientId'); // populate client info if needed
    
    // Calculate revenue from applications (assuming fee field exists)
    const totalRevenue = applications.reduce((sum, app) => sum + (app.fee || app.applicationFee || app.serviceFee || 0), 0);
    
    // For now, using a simple calculation - in a real system this would come from expense records
    const totalExpenses = applications.length * 15; // Assuming $15 per application in expenses
    
    const netProfit = totalRevenue - totalExpenses;
    
    // Create transaction data from applications
    const transactions: Transaction[] = applications
      .filter(app => (app.fee || app.applicationFee || app.serviceFee || 0) > 0)
      .map(app => ({
        id: app._id.toString(),
        description: `Visa Application - ${app.visaType || 'General'}`,
        client: app.clientId?.name || app.clientName || 'Unknown Client',
        amount: app.fee || app.applicationFee || app.serviceFee || 0,
        type: 'revenue',
        category: 'Application Fees',
        date: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    
    // Get commission data
    const totalCommissionEarned = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: '$commissionEarned' } } }
    ]);
    
    return NextResponse.json({
      transactions,
      totalRevenue,
      totalExpenses,
      netProfit,
      totalCommissionEarned: totalCommissionEarned[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching accounting data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounting data' },
      { status: 500 }
    );
  }
}