import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import FeeStructure from '@/models/FeeStructure';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all fee structures
    const feeStructures = await FeeStructure.find({}).sort({ createdAt: -1 }).lean();

    const feeStructureData = {
      feeStructures: feeStructures.map(fee => ({
        id: fee._id.toString(),
        name: fee.name,
        governmentFee: fee.governmentFee,
        serviceFee: fee.serviceFee,
        currency: fee.currency,
        description: fee.description,
        isActive: fee.isActive,
        createdAt: fee.createdAt.toISOString(),
        updatedAt: fee.updatedAt.toISOString()
      }))
    };

    return NextResponse.json(feeStructureData);
  } catch (error) {
    console.error('Error fetching fee structure data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee structure data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { action } = body;

    switch(action) {
      case 'create-fee-structure':
        if (!body.name || typeof body.governmentFee === 'undefined' || typeof body.serviceFee === 'undefined') {
          return NextResponse.json(
            { error: 'Missing required fields for fee structure creation' }, 
            { status: 400 }
          );
        }

        const newFeeStructure = new FeeStructure({
          name: body.name,
          governmentFee: body.governmentFee,
          serviceFee: body.serviceFee,
          currency: body.currency || 'USD',
          description: body.description || '',
          isActive: body.isActive !== undefined ? body.isActive : true
        });

        await newFeeStructure.save();

        return NextResponse.json({ 
          success: true, 
          feeStructure: {
            id: newFeeStructure._id.toString(),
            name: newFeeStructure.name,
            governmentFee: newFeeStructure.governmentFee,
            serviceFee: newFeeStructure.serviceFee,
            currency: newFeeStructure.currency,
            description: newFeeStructure.description,
            isActive: newFeeStructure.isActive
          }
        });

      case 'update-fee-structure':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Fee structure ID is required for update' }, 
            { status: 400 }
          );
        }

        const updatedFeeStructure = await FeeStructure.findByIdAndUpdate(
          body.id,
          { 
            name: body.name,
            governmentFee: body.governmentFee,
            serviceFee: body.serviceFee,
            currency: body.currency,
            description: body.description,
            isActive: body.isActive
          },
          { new: true }
        );

        if (!updatedFeeStructure) {
          return NextResponse.json(
            { error: 'Fee structure not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          feeStructure: {
            id: updatedFeeStructure._id.toString(),
            name: updatedFeeStructure.name,
            governmentFee: updatedFeeStructure.governmentFee,
            serviceFee: updatedFeeStructure.serviceFee,
            currency: updatedFeeStructure.currency,
            description: updatedFeeStructure.description,
            isActive: updatedFeeStructure.isActive
          }
        });

      case 'delete-fee-structure':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Fee structure ID is required for deletion' }, 
            { status: 400 }
          );
        }

        const deletedFeeStructure = await FeeStructure.findByIdAndDelete(body.id);

        if (!deletedFeeStructure) {
          return NextResponse.json(
            { error: 'Fee structure not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true,
          message: 'Fee structure deleted successfully'
        });

      case 'activate-fee-structure':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Fee structure ID is required for activation' }, 
            { status: 400 }
          );
        }

        const activatedFeeStructure = await FeeStructure.findByIdAndUpdate(
          body.id,
          { isActive: true },
          { new: true }
        );

        if (!activatedFeeStructure) {
          return NextResponse.json(
            { error: 'Fee structure not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          feeStructure: {
            id: activatedFeeStructure._id.toString(),
            isActive: activatedFeeStructure.isActive
          }
        });

      case 'deactivate-fee-structure':
        if (!body.id) {
          return NextResponse.json(
            { error: 'Fee structure ID is required for deactivation' }, 
            { status: 400 }
          );
        }

        const deactivatedFeeStructure = await FeeStructure.findByIdAndUpdate(
          body.id,
          { isActive: false },
          { new: true }
        );

        if (!deactivatedFeeStructure) {
          return NextResponse.json(
            { error: 'Fee structure not found' }, 
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          feeStructure: {
            id: deactivatedFeeStructure._id.toString(),
            isActive: deactivatedFeeStructure.isActive
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling fee structure action:', error);
    return NextResponse.json(
      { error: 'Failed to handle fee structure action' }, 
      { status: 500 }
    );
  }
}