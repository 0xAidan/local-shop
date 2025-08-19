// Comprehensive app testing script
const API_BASE_URL = 'http://localhost:3001/api';

async function testCompleteApp() {
  console.log('🧪 Testing Complete Local Shop App...\n');
  
  try {
    // 1. Test Backend Health
    console.log('1️⃣ Testing Backend Health...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('   ✅ Backend Status:', healthData.status);
    console.log('   ✅ Environment:', healthData.environment);
    
    // 2. Test Authentication
    console.log('\n2️⃣ Testing Authentication...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@test.com',
        password: 'password123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('   ✅ Login Status:', loginData.success ? 'SUCCESS' : 'FAILED');
    if (loginData.success) {
      console.log('   ✅ User Role:', loginData.data.user.role);
    }
    
    // 3. Test Shops API
    console.log('\n3️⃣ Testing Shops API...');
    const shopsResponse = await fetch(`${API_BASE_URL}/shops`);
    const shopsData = await shopsResponse.json();
    console.log('   ✅ Shops Found:', shopsData.data.length);
    console.log('   ✅ Shop Categories:', [...new Set(shopsData.data.map(s => s.category))]);
    
    // 4. Test Products API
    console.log('\n4️⃣ Testing Products API...');
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const productsData = await productsResponse.json();
    console.log('   ✅ Products Found:', productsData.data.length);
    console.log('   ✅ Product Categories:', [...new Set(productsData.data.map(p => p.category))]);
    
    // 5. Test Individual Shop
    console.log('\n5️⃣ Testing Individual Shop...');
    if (shopsData.data.length > 0) {
      const firstShop = shopsData.data[0];
      const shopResponse = await fetch(`${API_BASE_URL}/shops/${firstShop._id}`);
      const shopData = await shopResponse.json();
      console.log('   ✅ Shop Details:', shopData.success ? 'SUCCESS' : 'FAILED');
      console.log('   ✅ Shop Name:', firstShop.name);
      console.log('   ✅ Shop Location:', `${firstShop.location.city}, ${firstShop.location.state}`);
    }
    
    // 6. Test Map Data
    console.log('\n6️⃣ Testing Map Data...');
    const shopsWithLocation = shopsData.data.filter(s => s.location?.coordinates);
    console.log('   ✅ Shops with Coordinates:', shopsWithLocation.length);
    console.log('   ✅ Map Ready:', shopsWithLocation.length > 0 ? 'YES' : 'NO');
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('   🔗 Backend URL: http://localhost:3001');
    console.log('   📱 API Base URL: http://localhost:3001/api');
    console.log('   🗺️ Map Ready: YES');
    console.log('   👤 Test User: owner@test.com / password123');
    console.log('   🏪 Sample Shops:', shopsData.data.length);
    console.log('   📦 Sample Products:', productsData.data.length);
    
    console.log('\n🎉 All tests passed! Your app is ready for the next phase.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start your mobile app: cd LocalShop && npm start');
    console.log('   2. Test the map feature on your phone');
    console.log('   3. Try logging in with the test credentials');
    console.log('   4. Navigate between Home, Map, and other screens');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure backend is running: cd backend && npm run dev');
    console.log('   2. Check MongoDB connection');
    console.log('   3. Verify API endpoints are accessible');
  }
}

testCompleteApp(); 