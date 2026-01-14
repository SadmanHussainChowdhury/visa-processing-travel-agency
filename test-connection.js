const { MongoClient } = require('mongodb');

// Access the environment variable
const uri = process.env.MONGODB_URI;

async function testConnection() {
  if (!uri) {
    console.error('❌ MONGODB_URI is not set');
    return;
  }
  
  console.log('📋 Using connection string:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));
  
  const client = new MongoClient(uri, {});
  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB Atlas');
    const db = client.db();
    console.log('📊 Database name:', db.databaseName);
    await client.close();
    console.log('🔒 Disconnected successfully');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    if (err.message.includes('Authentication failed') || err.code === 8000) {
      console.log('\n🔧 SOLUTIONS TO TRY:');
      console.log('1. Verify your MongoDB Atlas username and password are correct');
      console.log('2. Make sure your IP address is whitelisted in MongoDB Atlas dashboard');
      console.log('3. Ensure the database user has proper read/write permissions');
      console.log('4. Check that the database name in the connection string exists');
    }
  }
}

testConnection();