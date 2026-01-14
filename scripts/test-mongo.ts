import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Import the connection string from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

console.log('🔍 MONGODB_URI found:', !!MONGODB_URI);

console.log('🔍 Testing MongoDB connection...');
// Safely mask the password in the connection string for logging
const maskedURI = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log('📋 Connection string:', maskedURI);

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    // Connect without buffering commands
    const connection = await mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Database name:', connection.connection.name);
    console.log('📍 Host:', connection.connection.host);
    console.log('🔢 Port:', connection.connection.port);

    // Test basic operations
    console.log('🔍 Testing basic database operations...');
    
    // Check if db exists in connection
    if (connection.connection.db) {
      // List collections
      const collections = await connection.connection.db.collections();
      console.log(`📦 Found ${collections.length} collections:`, collections.map(c => c.collectionName));
      
      // Test with a simple query
      const usersCollection = connection.connection.db.collection('users');
      const userCount = await usersCollection.countDocuments({});
      console.log(`👥 Users in collection: ${userCount}`);
    } else {
      console.log('⚠️ Database connection object not available');
    }
    
    // Close the connection
    await mongoose.disconnect();
    console.log('🔒 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error);
    
    if ((error as any).code === 8000) {
      console.log('\n🚨 Authentication Error:');
      console.log('   This typically means:');
      console.log('   1. Username/password in the connection string is incorrect');
      console.log('   2. The database user does not have access to the specified database');
      console.log('   3. IP address is not whitelisted in MongoDB Atlas');
      console.log('   4. Database name in the connection string is incorrect');
    }
    
    process.exit(1);
  }
}

testConnection();