const fs = require('fs');
const path = require('path');

// Read the .env.local file directly
const envFilePath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envFilePath, 'utf8');

console.log('📋 Raw .env.local content:');
console.log(envContent);
console.log('---');

// Parse the environment variables
const envLines = envContent.split('\n').filter(line => line.trim() !== '');
const envVars = {};

envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim();
    envVars[key] = value;
    console.log(`${key} = ${value.replace(/(\/\/.*:)(.*)(@)/, '$1***$3')}`); // Mask password
  }
});

console.log('---');
console.log('🔍 MONGODB_URI found:', !!envVars.MONGODB_URI);

// Now test the connection
if (envVars.MONGODB_URI) {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(envVars.MONGODB_URI, {});
  
  async function testConnection() {
    try {
      console.log('🔌 Attempting to connect to MongoDB...');
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
} else {
  console.log('❌ MONGODB_URI not found in .env.local file');
}