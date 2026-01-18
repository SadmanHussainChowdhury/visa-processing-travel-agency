import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Commission from '@/models/Commission';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch recent transactions
    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate summary statistics
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: 'revenue' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalExpenses = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const netProfit = (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0);
    
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