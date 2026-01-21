import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Commission from '@/models/Commission';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch recent transactions
    const transactions = []; // No transaction data available
    
    // Calculate summary statistics
    const totalRevenue = [{ total: 0 }]; // Placeholder for revenue
    const totalExpenses = [{ total: 0 }]; // Placeholder for expenses
    
    const netProfit = 0; // Placeholder for net profit
    
    // Get commission data
    const totalCommissionEarned = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: '$commissionEarned' } } }
    ]);
    
    return NextResponse.json({
      transactions,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
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