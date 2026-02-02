import mongoose from 'mongoose';
import Client from '../models/Client';
import Appointment from '../models/Appointment';
import dbConnect from '../lib/mongodb';

async function testVisaAgencyData() {
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    console.log('✅ Connected to database\n');

    // Get all clients
    console.log('📊 Checking existing clients...');
    const allClients = await Client.find({}).sort({ createdAt: -1 });
    console.log(`Total clients in database: ${allClients.length}\n`);

    if (allClients.length > 0) {
      console.log('📋 Sample clients:');
      allClients.slice(0, 5).forEach((client: any, index: number) => {
        console.log(`\n${index + 1}. ID: ${client._id}`);
        console.log(`   Client Name: ${client.firstName} ${client.lastName}`);
        console.log(`   Email: ${client.email}`);
        console.log(`   Visa Type: ${client.visaType}`);
        console.log(`   Created: ${client.createdAt}`);
      });
    }

    // Count by visa type
    console.log('\n📈 Counts by visa type:');
    const countsByVisaType = await Client.aggregate([
      {
        $group: {
          _id: '$visaType',
          count: { $sum: 1 }
        }
      }
    ]);
    countsByVisaType.forEach((item: any) => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    // Get all appointments
    console.log('\n📅 Checking existing appointments...');
    const allAppointments = await Appointment.find({}).sort({ appointmentDate: -1 });
    console.log(`Total appointments in database: ${allAppointments.length}\n`);

    if (allAppointments.length > 0) {
      console.log('📋 Sample appointments:');
      allAppointments.slice(0, 5).forEach((appointment: any, index: number) => {
        console.log(`\n${index + 1}. ID: ${appointment._id}`);
        console.log(`   Client Name: ${appointment.clientName}`);
        console.log(`   Appointment Type: ${appointment.appointmentType}`);
        console.log(`   Status: ${appointment.status}`);
        console.log(`   Date: ${appointment.appointmentDate}`);
      });
    }

    // Get a client to test with
    console.log('\n🔍 Finding a client to test with...');
    const testClient = await Client.findOne({});
    if (!testClient) {
      console.log('❌ No clients found in database. Please seed the database first.');
      process.exit(1);
    }

    console.log(`✅ Found test client: ${testClient.firstName} ${testClient.lastName} (ID: ${testClient._id})\n`);

    // Test creating a new appointment
    console.log('🧪 Testing appointment creation...');
    const testAppointment = new Appointment({
      clientName: `${testClient.firstName} ${testClient.lastName}`,
      clientEmail: testClient.email,
      clientPhone: testClient.phone,
      consultantName: 'Visa Consultant',
      consultantEmail: 'admin@visaagency.com',
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      appointmentTime: '10:00 AM',
      appointmentType: 'visa-consultation',
      status: 'scheduled',
      notes: 'Initial visa consultation'
    });

    await testAppointment.save();
    console.log('✅ Test appointment created successfully!');
    console.log(`   Saved ID: ${testAppointment._id}`);
    console.log(`   Client: ${testAppointment.clientName}`);
    console.log(`   Type: ${testAppointment.appointmentType}\n`);

    // Verify it was saved
    console.log('🔍 Verifying save...');
    const savedAppointment = await Appointment.findById(testAppointment._id);
    if (savedAppointment) {
      console.log('✅ Verification successful - appointment found in database!');
      console.log(`   Client: ${savedAppointment.clientName}`);
      console.log(`   Type: ${savedAppointment.appointmentType}\n`);
    } else {
      console.log('❌ Verification failed - appointment not found in database!\n');
    }

    // Test querying by client name
    console.log(`🔍 Testing query by client name: ${testClient.firstName} ${testClient.lastName}...`);
    const queryResults = await Appointment.find({ 
      clientName: { $regex: testClient.firstName + ' ' + testClient.lastName, $options: 'i' }
    });
    console.log(`✅ Found ${queryResults.length} appointments for this client\n`);

    // Clean up test appointment
    console.log('🧹 Cleaning up test appointment...');
    await Appointment.findByIdAndDelete(testAppointment._id);
    console.log('✅ Test appointment deleted\n');

    console.log('✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testVisaAgencyData();

