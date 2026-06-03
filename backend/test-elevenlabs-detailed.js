/**
 * Detailed ElevenLabs API Test
 */

require('dotenv').config();
const axios = require('axios');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

console.log('╔════════════════════════════════════════╗');
console.log('║   ElevenLabs API Detailed Test         ║');
console.log('╚════════════════════════════════════════╝\n');

console.log('Configuration:');
console.log(`  API Key: ${ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
console.log(`  Key Length: ${ELEVENLABS_API_KEY?.length || 0} characters`);
console.log(`  Key Preview: ${ELEVENLABS_API_KEY?.substring(0, 20)}...`);
console.log();

async function testEndpoints() {
  const endpoints = [
    { method: 'GET', path: '/user', description: 'Get user info' },
    { method: 'GET', path: '/voices', description: 'Get available voices' },
    { method: 'GET', path: '/models', description: 'Get available models' }
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint.description}`);
    console.log(`  ${endpoint.method} https://api.elevenlabs.io/v1${endpoint.path}`);

    try {
      const response = await axios({
        method: endpoint.method,
        url: `https://api.elevenlabs.io/v1${endpoint.path}`,
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`  ✅ Status: ${response.status}`);
      console.log(`  ✅ Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log(`  ❌ Status: ${error.response?.status || 'No response'}`);
      console.log(`  ❌ Error: ${error.message}`);
      if (error.response?.data) {
        console.log(`  ❌ Details: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log();
  }
}

testEndpoints().catch(console.error);
