import mongoose from 'mongoose';
import User from '../models/User';
import Client from '../models/Client';
import Appointment from '../models/Appointment';
import dbConnect from '../lib/mongodb';

async function seedDatabase() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    
    await Appointment.deleteMany({});

    console.log('Cleared existing data');

    // Create demo user
    const existingUser = await User.findOne({ email: 'admin@visaagency.com' });
    if (!existingUser) {
      const user = new User({
      email: 'admin@visaagency.com',
      name: 'Admin Demo User',
      role: 'admin',
      });
      await user.save();
      console.log('Created demo user');
    }

    // Create sample clients
    const clients = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'female',
        address: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zipCode: '12345',
        passportNumber: 'P12345678',
        passportCountry: 'USA',
        visaType: 'Tourist',
        visaApplicationDate: new Date(),
        specialRequirements: ['Vegetarian meals'],
        currentApplications: ['Tourist visa to Canada'],
        travelHistory: ['USA, Mexico, Canada'],
        emergencyContact: {
          name: 'John Johnson',
          phone: '+1-555-0102',
          relationship: 'Spouse'
        },
        assignedOfficer: 'Visa Consultant'
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0201',
        dateOfBirth: new Date('1990-07-22'),
        gender: 'male',
        address: '456 Oak Ave',
        city: 'Somewhere',
        state: 'CA',
        zipCode: '90210',
        passportNumber: 'P87654321',
        passportCountry: 'Canada',
        visaType: 'Business',
        visaApplicationDate: new Date(),
        specialRequirements: [],
        currentApplications: ['Business visa to USA'],
        travelHistory: ['Canada, USA, UK'],
        emergencyContact: {
          name: 'Lisa Chen',
          phone: '+1-555-0202',
          relationship: 'Sister'
        },
        assignedOfficer: 'Visa Consultant'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0301',
        dateOfBirth: new Date('1988-11-08'),
        gender: 'female',
        address: '789 Pine Rd',
        city: 'Elsewhere',
        state: 'TX',
        zipCode: '75001',
        passportNumber: 'P11223344',
        passportCountry: 'UK',
        visaType: 'Student',
        visaApplicationDate: new Date(),
        specialRequirements: ['Disability accommodation'],
        currentApplications: ['Student visa to USA'],
        travelHistory: ['UK, France, Germany, USA'],
        emergencyContact: {
          name: 'Robert Davis',
          phone: '+1-555-0302',
          relationship: 'Father'
        },
        assignedOfficer: 'Visa Consultant'
      }
    ];

    const createdClients = await Client.insertMany(clients);
    console.log(`Created ${createdClients.length} clients`);

    // Create sample appointments
    const appointments = [
      {
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah.johnson@email.com',
        clientPhone: '+1-555-0101',
        consultantName: 'Visa Consultant',
        consultantEmail: 'admin@visaagency.com',
        appointmentDate: new Date(),
        appointmentTime: '09:00 AM',
        appointmentType: 'visa-consultation',
        status: 'confirmed',
        notes: 'Visa consultation for tourist trip to Canada',
        symptoms: [],
        diagnosis: '',
        treatment: ''
      },
      {
        clientName: 'Michael Chen',
        clientEmail: 'michael.chen@email.com',
        clientPhone: '+1-555-0201',
        consultantName: 'Visa Consultant',
        consultantEmail: 'admin@visaagency.com',
        appointmentDate: new Date(),
        appointmentTime: '10:30 AM',
        appointmentType: 'document-review',
        status: 'confirmed',
        notes: 'Document review for business visa application',
        requirements: [],
        consultationNotes: '',
        recommendations: ''
      },
      {
        clientName: 'Emily Davis',
        clientEmail: 'emily.davis@email.com',
        clientPhone: '+1-555-0301',
        consultantName: 'Visa Consultant',
        consultantEmail: 'admin@visaagency.com',
        appointmentDate: new Date(),
        appointmentTime: '02:00 PM',
        appointmentType: 'application-submission',
        status: 'pending',
        notes: 'New student visa application submission',
        requirements: [],
        consultationNotes: '',
        recommendations: ''
      }
    ];

    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`Created ${createdAppointments.length} appointments`);


    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
