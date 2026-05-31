/**
 * Test ElevenLabs Transcription
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

async function testTranscription() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   ElevenLabs Transcription Test        ║');
  console.log('╚════════════════════════════════════════╝\n');

  if (!ELEVENLABS_API_KEY) {
    console.log('❌ ERROR: ELEVENLABS_API_KEY not configured in .env');
    return;
  }

  console.log('✅ API Key configured');
  console.log(`   Key: ${ELEVENLABS_API_KEY.substring(0, 10)}...${ELEVENLABS_API_KEY.substring(-10)}\n`);

  // Test 1: API Connectivity
  console.log('🔍 Testing API connectivity...');
  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/user`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      },
      timeout: 10000
    });
    console.log('✅ API Connectivity: SUCCESS\n');
  } catch (error) {
    console.log('❌ API Connectivity: FAILED');
    console.log(`   Error: ${error.message}\n`);
    return;
  }

  // Test 2: Transcribe audio file
  console.log('🎙️  Testing transcription with harvard.wav...');
  const audioPath = path.join(__dirname, 'uploads/harvard.wav');

  if (!fs.existsSync(audioPath)) {
    console.log(`❌ Audio file not found: ${audioPath}\n`);
    return;
  }

  const fileSize = (fs.statSync(audioPath).size / 1024 / 1024).toFixed(2);
  console.log(`   File: harvard.wav (${fileSize}MB)`);

  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(audioPath);
    formData.append('audio', fileStream);

    console.log('   Sending to ElevenLabs API...');
    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/speech-to-text`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'xi-api-key': ELEVENLABS_API_KEY
        },
        timeout: 120000
      }
    );

    console.log('✅ Transcription: SUCCESS\n');
    console.log('📝 Transcription Result:');
    console.log('─'.repeat(50));
    console.log(response.data.text);
    console.log('─'.repeat(50));
    console.log(`\n✅ Transcription length: ${response.data.text.length} characters`);
  } catch (error) {
    console.log('❌ Transcription: FAILED');
    console.log(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data)}`);
    }
  }
}

testTranscription().catch(console.error);
