import mongoose from 'mongoose';
import User from '../models/User';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import dbConnect from '../lib/mongodb';

async function seedDatabase() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});

    console.log('Cleared existing data');

    // Create demo user
    const existingUser = await User.findOne({ email: 'doctor@aidoc.com' });
    if (!existingUser) {
      const user = new User({
      email: 'doctor@aidoc.com',
      name: 'Dr. Demo User',
      role: 'doctor',
      });
      await user.save();
      console.log('Created demo user');
    }

    // Create sample patients
    const patients = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'female' as const,
        address: '123 Main St, Anytown, USA',
        emergencyContact: {
          name: 'John Johnson',
          phone: '+1-555-0102',
          relationship: 'Spouse'
        },
        medicalHistory: ['Hypertension', 'Diabetes Type 2'],
        allergies: ['Penicillin', 'Peanuts'],
        currentMedications: ['Metformin', 'Lisinopril'],
        bloodType: 'A+' as const,
        insuranceProvider: 'Blue Cross Blue Shield',
        insuranceNumber: 'BCBS123456',
        assignedDoctor: 'Dr. Demo User'
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0201',
        dateOfBirth: new Date('1990-07-22'),
        gender: 'male' as const,
        address: '456 Oak Ave, Somewhere, USA',
        emergencyContact: {
          name: 'Lisa Chen',
          phone: '+1-555-0202',
          relationship: 'Sister'
        },
        medicalHistory: ['Asthma'],
        allergies: ['Dust', 'Pollen'],
        currentMedications: ['Albuterol'],
        bloodType: 'O+' as const,
        insuranceProvider: 'Aetna',
        insuranceNumber: 'AET789012',
        assignedDoctor: 'Dr. Demo User'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0301',
        dateOfBirth: new Date('1988-11-08'),
        gender: 'female' as const,
        address: '789 Pine Rd, Elsewhere, USA',
        emergencyContact: {
          name: 'Robert Davis',
          phone: '+1-555-0302',
          relationship: 'Father'
        },
        medicalHistory: ['Migraine', 'Anxiety'],
        allergies: ['Sulfa drugs'],
        currentMedications: ['Sumatriptan', 'Sertraline'],
        bloodType: 'B-' as const,
        insuranceProvider: 'Cigna',
        insuranceNumber: 'CIG345678',
        assignedDoctor: 'Dr. Demo User'
      }
    ];

    const createdPatients = await Patient.insertMany(patients);
    console.log(`Created ${createdPatients.length} patients`);

    // Create sample appointments
    const appointments = [
      {
        patientName: 'Sarah Johnson',
        patientEmail: 'sarah.johnson@email.com',
        patientPhone: '+1-555-0101',
        doctorName: 'Dr. Demo User',
        doctorEmail: 'doctor@aidoc.com',
        appointmentDate: new Date(),
        appointmentTime: '09:00 AM',
        appointmentType: 'consultation' as const,
        status: 'confirmed' as const,
        notes: 'Follow-up for diabetes management',
        symptoms: ['Fatigue', 'Increased thirst'],
        diagnosis: 'Diabetes Type 2',
        treatment: 'Continue Metformin, monitor blood sugar'
      },
      {
        patientName: 'Michael Chen',
        patientEmail: 'michael.chen@email.com',
        patientPhone: '+1-555-0201',
        doctorName: 'Dr. Demo User',
        doctorEmail: 'doctor@aidoc.com',
        appointmentDate: new Date(),
        appointmentTime: '10:30 AM',
        appointmentType: 'follow-up' as const,
        status: 'confirmed' as const,
        notes: 'Asthma control check',
        symptoms: ['Wheezing', 'Shortness of breath'],
        diagnosis: 'Asthma',
        treatment: 'Continue Albuterol, avoid triggers'
      },
      {
        patientName: 'Emily Davis',
        patientEmail: 'emily.davis@email.com',
        patientPhone: '+1-555-0301',
        doctorName: 'Dr. Demo User',
        doctorEmail: 'doctor@aidoc.com',
        appointmentDate: new Date(),
        appointmentTime: '02:00 PM',
        appointmentType: 'consultation' as const,
        status: 'pending' as const,
        notes: 'New patient consultation',
        symptoms: ['Headaches', 'Nausea'],
        diagnosis: 'Migraine',
        treatment: 'Prescribe Sumatriptan, lifestyle modifications'
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
