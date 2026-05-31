/**
 * Test ElevenLabs Speech-to-Text Endpoint
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

console.log('╔════════════════════════════════════════╗');
console.log('║   ElevenLabs Speech-to-Text Test       ║');
console.log('╚════════════════════════════════════════╝\n');

console.log('Configuration:');
console.log(`  API Key: ${ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
console.log(`  Key: ${ELEVENLABS_API_KEY?.substring(0, 20)}...`);
console.log();

async function testSpeechToText() {
  const audioPath = path.join(__dirname, 'uploads/harvard.wav');

  if (!fs.existsSync(audioPath)) {
    console.log(`❌ Audio file not found: ${audioPath}`);
    return;
  }

  const fileSize = (fs.statSync(audioPath).size / 1024 / 1024).toFixed(2);
  console.log(`Testing: Speech-to-Text Transcription`);
  console.log(`  File: harvard.wav (${fileSize}MB)`);
  console.log(`  Endpoint: POST ${ELEVENLABS_BASE_URL}/speech-to-text`);
  console.log();

  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(audioPath);
    formData.append('file', fileStream); // Changed from 'audio' to 'file'
    formData.append('model_id', 'scribe_v2'); // ElevenLabs speech-to-text model

    console.log('  Sending request...');
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

    console.log('✅ Speech-to-Text: SUCCESS\n');
    console.log('📝 Transcription Result:');
    console.log('─'.repeat(60));
    console.log(response.data.text);
    console.log('─'.repeat(60));
    console.log(`\n✅ Transcription length: ${response.data.text.length} characters`);
    console.log(`✅ Confidence: ${response.data.confidence || 'N/A'}`);
  } catch (error) {
    console.log('❌ Speech-to-Text: FAILED\n');
    console.log(`  Status: ${error.response?.status || 'No response'}`);
    console.log(`  Error: ${error.message}`);
    if (error.response?.data?.detail) {
      console.log(`  Details: ${JSON.stringify(error.response.data.detail)}`);
    }
  }
}

testSpeechToText().catch(console.error);
