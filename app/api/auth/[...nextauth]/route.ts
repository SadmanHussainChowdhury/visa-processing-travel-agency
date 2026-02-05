import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '../../../../lib/mongodb-adapter';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            // For demo purposes, allow the demo account without database
            if (credentials.email === 'admin@visaagency.com' && credentials.password === 'password123') {
              const demoOtp = credentials.otp?.toString().trim();
              if (demoOtp !== '000000') {
                return null;
              }
              return {
                id: 'demo-user',
                email: 'admin@visaagency.com',
                name: 'Admin Demo User',
                role: 'admin',
                image: null,
              };
            }
            return null;
          }

          // In a real app, you would hash passwords and compare them
          // For now, we'll use a simple comparison for demo purposes
          if (credentials.password === 'password123') {
            const otp = credentials.otp?.toString().trim();
            if (!otp || !user.smsOtpHash || !user.smsOtpExpiresAt) {
              return null;
            }

            if (user.smsOtpExpiresAt.getTime() < Date.now()) {
              return null;
            }

            const otpValid = await bcrypt.compare(otp, user.smsOtpHash);
            if (!otpValid) {
              return null;
            }

            user.smsOtpHash = undefined;
            user.smsOtpExpiresAt = undefined;
            user.smsOtpRequestedAt = undefined;
            await user.save();

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
              phone: user.phone || null,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.phone = user.phone || null;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.phone = token.phone as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
