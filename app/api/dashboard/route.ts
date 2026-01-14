import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import Client from '../../../models/Client';
import Appointment from '../../../models/Appointment';
import dbConnect from '../../../lib/mongodb';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  createdAt: Date;
  status: string;
}


export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get today's date range
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get last month's date range for percentage calculations
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), lastMonth.getDate());
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Fetch all stats in parallel
    const [
      totalClients,
      clientsLastMonth,
      appointmentsToday,
      appointmentsLastMonth,
      recentAppointments,
      recentClients
    ] = await Promise.all([
      // Total clients
      Client.countDocuments(),

      // Clients from last month
      Client.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
      }),

      // Appointments today
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfToday, $lt: endOfToday },
        status: { $ne: 'cancelled' }
      }),

      // Appointments last month
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        status: { $ne: 'cancelled' }
      }),

      // Recent appointments (get more to ensure we have enough for top 10)
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('_id patientName doctorName appointmentDate appointmentTime status createdAt'),

      // Recent clients (get more to ensure we have enough for top 10)
      Client.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('firstName lastName email createdAt')
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? '+' : '';
      return `${sign}${Math.round(change)}%`;
    };

    // Build stats array
    const stats = [
      {
        name: 'totalClients',
        value: totalClients.toString(),
        change: calculateChange(totalClients, clientsLastMonth),
        changeType: totalClients >= clientsLastMonth ? 'positive' : 'negative'
      },
      {
        name: 'appointmentsToday',
        value: appointmentsToday.toString(),
        change: calculateChange(appointmentsToday, appointmentsLastMonth),
        changeType: appointmentsToday >= appointmentsLastMonth ? 'positive' : 'negative'
      },

      {
        name: 'aiInsights',
        value: '0', // TODO: Implement AI insights tracking
        change: '+0%',
        changeType: 'neutral'
      }
    ];

    // Build recent activities
    const recentActivities: Activity[] = [];

    // Add recent appointments
    recentAppointments.forEach((appointment: any) => {
      recentActivities.push({
        id: appointment._id.toString(),
        type: 'appointment',
        title: `Appointment scheduled: ${appointment.patientName}`,
        description: `${appointment.doctorName} - ${appointment.appointmentTime}`,
        time: formatTimeAgo(appointment.createdAt),
        createdAt: appointment.createdAt,
        status: appointment.status
      });
    });

    // Add recent clients
    recentClients.forEach((client: any) => {
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



    // Sort activities by createdAt date (most recent first) and limit to 5
    recentActivities.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    });
    
    // Limit to 5 most recent activities
    const limitedRecentActivities = recentActivities.slice(0, 5);

    // Get upcoming appointments (today and future dates)
    // Reuse startOfToday that was already defined above
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfToday },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(4)
    .select('_id patientName appointmentTime appointmentType status appointmentDate');
    
    console.log('Upcoming appointments found:', upcomingAppointments.length);

    const formattedUpcomingAppointments = upcomingAppointments.map(appointment => ({
      id: appointment._id.toString(),
      client: appointment.patientName || 'Unknown Client',
      time: appointment.appointmentTime || 'N/A',
      type: appointment.appointmentType || 'consultation',
      status: appointment.status === 'confirmed' ? 'confirmed' : 'pending'
    }));
    
    console.log('Formatted upcoming appointments:', formattedUpcomingAppointments);

    return NextResponse.json({
      stats,
      recentActivities: limitedRecentActivities,
      upcomingAppointments: formattedUpcomingAppointments
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
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

  if (diffInHours > 0) {
    return `${diffInHours} hours ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minutes ago`;
  } else {
    return 'Just now';
  }
}
