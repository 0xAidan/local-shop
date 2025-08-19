// Simple test to verify API connection
const API_BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('🧪 Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    
    // Test shops endpoint
    const shopsResponse = await fetch(`${API_BASE_URL}/shops`);
    const shopsData = await shopsResponse.json();
    console.log('✅ Shops API:', `${shopsData.data.length} shops found`);
    
    // Test products endpoint
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const productsData = await productsResponse.json();
    console.log('✅ Products API:', `${productsData.data.length} products found`);
    
    console.log('\n🎉 All API tests passed! Your mobile app should work perfectly.');
    console.log('\n📱 Next steps:');
    console.log('   1. Open your mobile app');
    console.log('   2. Login with: customer@test.com / password');
    console.log('   3. Explore the shops and try the new map feature!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the backend is running: npm run dev (in backend folder)');
    console.log('   2. Check that MongoDB is connected');
    console.log('   3. Verify the API URL in your mobile app');
  }
}

testAPI(); 