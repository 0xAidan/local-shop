#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Local Shop App Setup...\n');

// Test 1: Check if backend is running
console.log('1. Testing backend server...');
try {
  const healthResponse = execSync('curl -s http://localhost:3001/health', { encoding: 'utf8' });
  const healthData = JSON.parse(healthResponse);
  console.log('✅ Backend is running:', healthData.message);
} catch (error) {
  console.log('❌ Backend is not running. Please start it with: cd backend && npm start');
  process.exit(1);
}

// Test 2: Check if mobile app dependencies are installed
console.log('\n2. Checking mobile app dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log('✅ Mobile app package.json found');
  console.log('   Dependencies count:', Object.keys(packageJson.dependencies || {}).length);
} catch (error) {
  console.log('❌ Mobile app package.json not found or invalid');
  process.exit(1);
}

// Test 3: Check if node_modules exists
console.log('\n3. Checking node_modules...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('❌ node_modules not found. Run: npm install');
  process.exit(1);
}

// Test 4: Test API connectivity from network
console.log('\n4. Testing API from network...');
try {
  const networkResponse = execSync('curl -s http://10.0.0.97:3001/health', { encoding: 'utf8' });
  const networkData = JSON.parse(networkResponse);
  console.log('✅ API accessible from network:', networkData.message);
} catch (error) {
  console.log('❌ API not accessible from network');
  console.log('   This might cause issues on mobile devices');
}

// Test 5: Check environment setup
console.log('\n5. Checking environment setup...');
const envFile = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envFile)) {
  console.log('✅ Backend .env file exists');
} else {
  console.log('⚠️  Backend .env file not found');
  console.log('   Run: cd backend && cp env.example .env');
}

console.log('\n🎉 Setup test completed!');
console.log('\n📱 To start the mobile app:');
console.log('   npm start');
console.log('\n🔧 If you encounter issues:');
console.log('   1. Make sure backend is running: cd backend && npm start');
console.log('   2. Check your IP address: ifconfig | grep "inet " | grep -v 127.0.0.1');
console.log('   3. Update API_BASE_URL in src/services/api.ts if needed');
console.log('   4. Use the "Test API Connection" button in the app'); 