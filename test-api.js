const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check:', health.data.message);

    // Test 2: Login (use your admin credentials)
    console.log('\n2. Testing login...');
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const token = login.data.token;
    console.log('✅ Login successful, token received');

    // Test 3: Get home content
    console.log('\n3. Testing home content...');
    const homeContent = await axios.get(`${BASE_URL}/pages/home-content`);
    console.log('✅ Home content:', homeContent.data.data.heroTitle);

    // Test 4: Get products (admin)
    console.log('\n4. Testing products admin endpoint...');
    const products = await axios.get(`${BASE_URL}/products/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Products count:', products.data.data.length);

    // Test 5: Get gallery
    console.log('\n5. Testing gallery endpoint...');
    const gallery = await axios.get(`${BASE_URL}/gallery/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Gallery count:', gallery.data.data.length);

    console.log('\n✅ All tests passed! API is working correctly.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status);
    console.error('Endpoint:', error.config?.url);
    process.exit(1);
  }
}

testAPI();
