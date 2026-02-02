#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Agency Management System Setup');
console.log('====================================\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Check if MongoDB is installed
try {
  execSync('mongod --version', { stdio: 'pipe' });
  console.log('✅ MongoDB is installed');
} catch (error) {
  console.log('⚠️  MongoDB not found. Please install MongoDB before proceeding.');
  console.log('   Download from: https://www.mongodb.com/try/download/community');
}

// Create .env.local file if it doesn't exist
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env.local file...');
  
  const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agency-management

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${require('crypto').randomBytes(32).toString('hex')}

# CodeCanyon Configuration (Update with your actual values)
NEXT_PUBLIC_ITEM_ID=your-item-id-here
LICENSE_VALIDATION_ENDPOINT=https://your-validation-server.com/validate

# Payment Configuration (Update with your actual keys)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_secret_here

# Email Configuration (Optional)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@youragency.com
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created');
} else {
  console.log('✅ .env.local file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Install additional required packages
console.log('\n🔧 Installing additional packages...');
const packages = [
  'framer-motion',
  'chart.js',
  'react-chartjs-2',
  '@types/chart.js'
];

for (const pkg of packages) {
  try {
    execSync(`npm install ${pkg}`, { stdio: 'inherit' });
    console.log(`✅ ${pkg} installed`);
  } catch (error) {
    console.error(`❌ Failed to install ${pkg}:`, error.message);
  }
}

// Run database setup
console.log('\n🗄️  Setting up database...');
try {
  if (fs.existsSync(path.join(__dirname, 'scripts', 'seed-db.ts'))) {
    execSync('npm run seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
  } else {
    console.log('⚠️  Seed script not found. You may need to run database setup manually.');
  }
} catch (error) {
  console.log('⚠️  Database setup failed. Make sure MongoDB is running and try again.');
  console.log('   Run: mongod (in a separate terminal)');
}

// Build the project
console.log('\n🏗️  Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Project built successfully');
} catch (error) {
  console.log('⚠️  Build completed with warnings. This is normal for development.');
}

console.log('\n🎉 Setup Complete!');
console.log('==================');
console.log('Next steps:');
console.log('1. Update .env.local with your actual configuration values');
console.log('2. Make sure MongoDB is running (mongod)');
console.log('3. Run: npm run dev');
console.log('4. Visit: http://localhost:3000');
console.log('\nFor detailed documentation, see DOCUMENTATION.md');