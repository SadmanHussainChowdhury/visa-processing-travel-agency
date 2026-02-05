import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    await dbConnect();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        systemTitle: 'VisaPilot - Visa & Travel Agency / Student Consultancy - Operations & CRM Platform',
        systemDescription: 'Operations & CRM Platform',
        currency: 'USD',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        language: 'en'
      });
      await settings.save();
    }

    return NextResponse.json({
      systemTitle: settings.systemTitle,
      systemDescription: settings.systemDescription
    });
  } catch (error) {
    console.error('Public settings fetch error:', error);
    return NextResponse.json(
      {
        systemTitle: 'VisaPilot - Visa & Travel Agency / Student Consultancy - Operations & CRM Platform',
        systemDescription: 'Operations & CRM Platform'
      },
      { status: 200 }
    );
  }
}
