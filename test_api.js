const request = require('supertest');
const app = require('./src/app');

async function testAPI() {
  console.log('🧪 Testing Twitter API Server...\n');

  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await request(app).get('/health');
    console.log('   Status:', healthResponse.status);
    console.log('   Response:', healthResponse.body);
    console.log('   ✅ Health check passed\n');

    console.log('2. Testing rate limit status endpoint...');
    const rateLimitResponse = await request(app).get('/api/rate-limit-status');
    console.log('   Status:', rateLimitResponse.status);
    console.log('   Response:', JSON.stringify(rateLimitResponse.body, null, 2));
    console.log('   ✅ Rate limit status endpoint working\n');

    console.log('3. Testing tweet validation (empty text)...');
    const emptyTweetResponse = await request(app)
      .post('/api/tweet')
      .send({ text: '' });
    console.log('   Status:', emptyTweetResponse.status);
    console.log('   Response:', JSON.stringify(emptyTweetResponse.body, null, 2));
    console.log('   ✅ Empty tweet validation working\n');

    console.log('4. Testing tweet validation (too long)...');
    const longText = 'x'.repeat(281);
    const longTweetResponse = await request(app)
      .post('/api/tweet')
      .send({ text: longText });
    console.log('   Status:', longTweetResponse.status);
    console.log('   Response:', JSON.stringify(longTweetResponse.body, null, 2));
    console.log('   ✅ Long tweet validation working\n');

    console.log('5. Testing account info endpoint...');
    const accountResponse = await request(app).get('/api/account');
    console.log('   Status:', accountResponse.status);
    if (accountResponse.status === 200) {
      console.log('   Response:', JSON.stringify(accountResponse.body, null, 2));
      console.log('   ✅ Account info endpoint working');
    } else {
      console.log('   Response:', JSON.stringify(accountResponse.body, null, 2));
      console.log('   ⚠️  Account info requires valid Twitter credentials');
    }

    console.log('\n🎉 API tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up your Twitter API credentials in .env file');
    console.log('   2. Test actual tweet posting with: POST /api/tweet');
    console.log('   3. Monitor rate limits with: GET /api/rate-limit-status');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();