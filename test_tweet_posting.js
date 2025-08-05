const request = require('supertest');
const app = require('./src/app');

async function testTweetPosting() {
  console.log('🐦 Testing Tweet Posting Functionality...\n');

  try {
    const testTweet = `Test tweet from Node.js API - ${new Date().toISOString()}`;

    console.log('📝 Attempting to post tweet:');
    console.log(`   "${testTweet}"`);
    console.log(`   Length: ${testTweet.length} characters\n`);

    const response = await request(app)
      .post('/api/tweet')
      .send({ text: testTweet });

    console.log('📊 Response:');
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(response.body, null, 2));

    if (response.status === 201) {
      console.log('\n🎉 Tweet posted successfully!');
      console.log(`   Tweet ID: ${response.body.data.id}`);
    } else if (response.status === 429) {
      console.log('\n⏰ Rate limit reached - this is expected behavior');
    } else if (response.status === 401) {
      console.log('\n🔑 Authentication failed - check your Twitter API credentials');
    } else {
      console.log('\n❌ Tweet posting failed');
    }

    console.log('\n📈 Checking rate limit status after attempt...');
    const rateLimitResponse = await request(app).get('/api/rate-limit-status');
    console.log('   Current limits:', JSON.stringify(rateLimitResponse.body.data.limits, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTweetPosting();