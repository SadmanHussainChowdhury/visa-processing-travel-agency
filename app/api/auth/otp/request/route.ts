import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Demo account handling
    if (email === 'admin@visaagency.com' && password === 'password123') {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Use OTP 000000 for the demo account.'
      });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // In this demo system, password is a simple check
    if (password !== 'password123') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.phone) {
      return NextResponse.json({ error: 'Phone number not set for this user' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ error: 'Twilio credentials are not configured' }, { status: 500 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.smsOtpHash = otpHash;
    user.smsOtpExpiresAt = expiresAt;
    user.smsOtpRequestedAt = new Date();
    await user.save();

    const params = new URLSearchParams();
    params.set('To', user.phone);
    params.set('From', fromNumber);
    params.set('Body', `Your VisaPilot verification code is ${otp}. It expires in 5 minutes.`);

    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
      },
      body: params.toString()
    });

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      return NextResponse.json({ error: 'Failed to send OTP', details: errorText }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
