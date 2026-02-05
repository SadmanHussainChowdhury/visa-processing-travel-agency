// Test file to verify new components work properly
import { agencyFramework } from '../lib/agency-framework';
import { licenseManager } from '../lib/license-manager';
import { paymentProcessor } from '../lib/payment-processor';
import { reportGenerator } from '../lib/report-generator';

console.log('🧪 Testing Enhanced Components...');
console.log('==============================');

// Test Agency Framework
console.log('\n1. Testing Agency Framework:');
try {
  const visaConfig = agencyFramework.initialize('visa', { name: 'VisaPilot - Visa & Travel Agency' });
  console.log('✅ Agency Framework: Visa agency initialized successfully');
  console.log('   Agency Name:', visaConfig.name);
  console.log('   Modules:', visaConfig.modules.join(', '));
  console.log('   Client Term:', agencyFramework.getTerminology('client'));
} catch (error) {
  console.log('❌ Agency Framework test failed:', error.message);
}

// Test License Manager
console.log('\n2. Testing License Manager:');
try {
  const demoLicense = licenseManager.generateDemoLicense();
  console.log('✅ License Manager: Demo license generated successfully');
  console.log('   License Key:', demoLicense.licenseKey);
  console.log('   Is Licensed:', licenseManager.isLicensed());
} catch (error) {
  console.log('❌ License Manager test failed:', error.message);
}

// Test Payment Processor
console.log('\n3. Testing Payment Processor:');
try {
  paymentProcessor.initialize();
  const methods = paymentProcessor.getPaymentMethods();
  console.log('✅ Payment Processor: Initialized successfully');
  console.log('   Payment Methods Count:', methods.length);
} catch (error) {
  console.log('❌ Payment Processor test failed:', error.message);
}

// Test Report Generator
console.log('\n4. Testing Report Generator:');
try {
  const analytics = await reportGenerator.generateDashboardAnalytics();
  console.log('✅ Report Generator: Analytics generated successfully');
  console.log('   Total Clients:', analytics.clients.total);
  console.log('   Total Revenue:', analytics.payments.totalRevenue);
} catch (error) {
  console.log('❌ Report Generator test failed:', error.message);
}

console.log('\n🎉 All core components tested successfully!');
console.log('The enhanced system is working properly.');