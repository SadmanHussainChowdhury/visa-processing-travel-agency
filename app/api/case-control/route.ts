import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MongoClient, ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('searchTerm') || '';
    const statusFilter = searchParams.get('statusFilter') || 'all';
    const showLockedCases = searchParams.get('showLockedCases') === 'true';

    const db = await dbConnect();
    const dbConnection = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-processing-travel-agency');
    const database = dbConnection.db();
    
    // Build query based on filters
    const query: any = {};
    
    if (searchTerm) {
      query.$or = [
        { caseId: { $regex: searchTerm, $options: 'i' } },
        { applicantName: { $regex: searchTerm, $options: 'i' } },
        { visaType: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }
    
    if (!showLockedCases) {
      if (query.status) {
        // If status filter is already applied, we need to add locked status to it
        if (Array.isArray(query.status)) {
          query.status.$ne = 'locked';
        } else if (query.status !== 'locked') {
          // Only exclude locked if we're not specifically looking for locked cases
        }
      } else {
        // If no status filter, exclude locked cases
        query.status = { $ne: 'locked' };
      }
    }

    const cases = await database.collection('visa-cases').find(query).toArray();

    // Transform the data to match our frontend interface
    const transformedCases = cases.map((c: any) => ({
      id: c._id.toString(),
      caseId: c.caseId,
      applicantName: c.clientName || c.applicantName,
      visaType: c.visaType,
      country: c.country,
      status: c.status || 'pending',
      submittedDate: c.submissionDate,
      lockedDate: c.lockedDate,
      supervisorReview: c.supervisorReview,
      versionHistory: c.versionHistory || [],
      approvalSteps: c.approvalSteps || [],
    }));

    return new Response(JSON.stringify(transformedCases), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching case control data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing case ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await dbConnect();
    const dbConnection = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-processing-travel-agency');
    const database = dbConnection.db();

    // Update the case
    const result = await database.collection('visa-cases').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Case not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return the updated case
    const updatedCase = await database.collection('visa-cases').findOne({ _id: new ObjectId(id) });
    
    if (!updatedCase) {
      return new Response(JSON.stringify({ error: 'Case not found after update' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const transformedCase = {
      id: updatedCase._id.toString(),
      caseId: updatedCase.caseId,
      clientName: updatedCase.clientName,
      visaType: updatedCase.visaType,
      country: updatedCase.country,
      status: updatedCase.status || 'pending',
      submittedDate: updatedCase.submissionDate,
      lockedDate: updatedCase.lockedDate,
      supervisorReview: updatedCase.supervisorReview,
      versionHistory: updatedCase.versionHistory || [],
      approvalSteps: updatedCase.approvalSteps || [],
      notes: updatedCase.notes || [],
      createdAt: updatedCase.createdAt,
      updatedAt: updatedCase.updatedAt
    };

    return new Response(JSON.stringify(transformedCase), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating case:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing case ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await dbConnect();
    const dbConnection = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-processing-travel-agency');
    const database = dbConnection.db();

    // Delete the case
    const result = await database.collection('visa-cases').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Case not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting case:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    
    // Check if this is a create operation (no action specified)
    if (!body.action) {
      // Create new case
      const { clientName, visaType, country, status, notes } = body;
      
      if (!clientName || !visaType || !country) {
        return new Response(JSON.stringify({ error: 'Missing required fields: clientName, visaType, country' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const db = await dbConnect();
      const dbConnection = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-processing-travel-agency');
      const database = dbConnection.db();
      
      const newCase = {
        clientName,
        visaType,
        country,
        status: status || 'pending',
        caseId: `VC-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versionHistory: [],
        approvalSteps: [
          {
            id: `step-1-${Date.now()}`,
            step: 1,
            title: 'Initial Review',
            completed: false,
            completedBy: null,
            completedDate: null,
            notes: null
          },
          {
            id: `step-2-${Date.now()}`,
            step: 2,
            title: 'Document Verification',
            completed: false,
            completedBy: null,
            completedDate: null,
            notes: null
          },
          {
            id: `step-3-${Date.now()}`,
            step: 3,
            title: 'Final Approval',
            completed: false,
            completedBy: null,
            completedDate: null,
            notes: null
          }
        ],
        notes: notes || []
      };

      const result = await database.collection('visa-cases').insertOne(newCase);
      
      const createdCase = {
        id: result.insertedId.toString(),
        ...newCase
      };

      return new Response(JSON.stringify(createdCase), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Existing action-based operations
    const { action, caseId, stepId, notes } = body;

    const db = await dbConnect();
    const dbConnection = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-processing-travel-agency');
    const database = dbConnection.db();

    if (action === 'lock') {
      // Lock the case to prevent further edits
      await database.collection('visa-cases').updateOne(
        { _id: new ObjectId(caseId) },
        { 
          $set: { 
            status: 'locked',
            lockedDate: new Date().toISOString()
          }
        }
      );
    } else if (action === 'unlock') {
      // Unlock the case to allow edits
      await database.collection('visa-cases').updateOne(
        { _id: new ObjectId(caseId) },
        { 
          $set: { 
            status: 'pending',
            lockedDate: null
          }
        }
      );
    } else if (action === 'approve-step') {
      // Approve a specific step in the approval process
      await database.collection('visa-cases').updateOne(
        { _id: new ObjectId(caseId), 'approvalSteps._id': stepId },
        { 
          $set: { 
            'approvalSteps.$.completed': true,
            'approvalSteps.$.completedBy': session.user?.name,
            'approvalSteps.$.completedDate': new Date().toISOString(),
            'approvalSteps.$.notes': notes
          }
        }
      );
    } else if (action === 'request-correction') {
      // Mark a step as needing correction
      await database.collection('visa-cases').updateOne(
        { _id: new ObjectId(caseId), 'approvalSteps._id': stepId },
        { 
          $set: { 
            'approvalSteps.$.completed': false,
            'approvalSteps.$.notes': notes || 'Correction requested'
          }
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating case control data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}