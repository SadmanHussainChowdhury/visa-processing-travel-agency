import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import Client from '../../../models/Client';
import Appointment from '../../../models/Appointment';
import dbConnect from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Fetch all activities
    const [
      recentAppointments,
      recentClients
    ] = await Promise.all([
      // Recent appointments
      Appointment.find()
        .sort({ createdAt: -1 })
        .select('_id clientName consultantName appointmentDate appointmentTime status createdAt'),

      // Recent clients
      Client.find()
        .sort({ createdAt: -1 })
        .select('firstName lastName createdAt')
    ]);

    // Build recent activities
    const recentActivities = [];

    // Add recent appointments
    recentAppointments.forEach(appointment => {
      recentActivities.push({
        id: appointment._id.toString(),
        type: 'appointment',
        title: `Appointment scheduled: ${appointment.clientName}`,
        description: `${appointment.consultantName} - ${appointment.appointmentTime}`,
        time: formatTimeAgo(appointment.createdAt),
        createdAt: appointment.createdAt,
        status: appointment.status
      });
    });

    // Add recent clients
    recentClients.forEach(client => {
      recentActivities.push({
        id: `client-${client._id}`,
        type: 'client',
        title: 'New client registered',
        description: `${client.firstName} ${client.lastName}`,
        time: formatTimeAgo(client.createdAt),
        createdAt: client.createdAt,
        status: 'completed'
      });
    });

    // Sort activities by createdAt date (most recent first)
    recentActivities.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    });

    // Apply pagination
    const total = recentActivities.length;
    const paginatedActivities = recentActivities.slice(skip, skip + limit);

    return NextResponse.json({
      activities: paginatedActivities,
      total,
      limit,
      skip
    });

  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}