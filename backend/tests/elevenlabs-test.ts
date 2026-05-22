/**
 * ElevenLabs API Test
 * Tests speech-to-text functionality with provided API key
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const ELEVENLABS_API_KEY = '3f4c54ec1757b785c63137dfcc081fb9639a492258fec1c1b46656aed6359edd';
const ELEVENLABS_BASE_URL = 'api.elevenlabs.io';

interface TranscriptionResult {
  text: string;
  confidence?: number;
  duration?: number;
}

class ElevenLabsTest {
  /**
   * Make HTTPS request helper
   */
  private makeRequest(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: Buffer
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: ELEVENLABS_BASE_URL,
        path,
        method,
        headers: {
          ...headers,
          'xi-api-key': ELEVENLABS_API_KEY
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * Test basic API connectivity
   */
  async testAPIConnectivity(): Promise<boolean> {
    try {
      console.log('🔍 Testing ElevenLabs API connectivity...');

      const response = await this.makeRequest('GET', '/v1/user', {
        'Content-Type': 'application/json'
      });

      if (response.status === 200) {
        console.log('✅ API Connectivity: SUCCESS');
        console.log('   User Info:', JSON.stringify(response.data, null, 2));
        return true;
      } else {
        console.log('❌ API Connectivity: FAILED');
        console.log('   Status:', response.status);
        console.log('   Response:', response.data);
        return false;
      }
    } catch (error: any) {
      console.log('❌ API Connectivity: FAILED');
      console.log('   Error:', error.message);
      return false;
    }
  }

  /**
   * Test available voices
   */
  async testAvailableVoices(): Promise<boolean> {
    try {
      console.log('\n🎵 Testing Available Voices...');

      const response = await this.makeRequest('GET', '/v1/voices', {
        'Content-Type': 'application/json'
      });

      if (response.status === 200) {
        console.log('✅ Available Voices: SUCCESS');
        const voiceCount = response.data.voices?.length || 0;
        console.log(`   Total voices: ${voiceCount}`);

        if (response.data.voices && response.data.voices.length > 0) {
          console.log('   Sample voices:');
          response.data.voices.slice(0, 3).forEach((voice: any) => {
            console.log(`     - ${voice.name} (${voice.voice_id})`);
          });
        }

        return true;
      } else {
        console.log('❌ Available Voices: FAILED');
        console.log('   Status:', response.status);
        console.log('   Response:', response.data);
        return false;
      }
    } catch (error: any) {
      console.log('❌ Available Voices: FAILED');
      console.log('   Error:', error.message);
      return false;
    }
  }

  /**
   * Test speech-to-text with a sample audio file
   */
  async testSpeechToText(audioFilePath: string): Promise<TranscriptionResult | null> {
    try {
      console.log(`\n🎙️  Testing Speech-to-Text with: ${audioFilePath}`);

      // Check if file exists
      if (!fs.existsSync(audioFilePath)) {
        console.log(`❌ Audio file not found: ${audioFilePath}`);
        return null;
      }

      const audioBuffer = fs.readFileSync(audioFilePath);
      const audioSize = (audioBuffer.length / 1024 / 1024).toFixed(2);
      console.log(`   File size: ${audioSize} MB`);

      // Note: ElevenLabs speech-to-text API requires multipart/form-data
      // which is complex with native https module. This is a placeholder.
      console.log('   ⚠️  Note: Full speech-to-text test requires multipart/form-data support');
      console.log('   Recommendation: Use axios or form-data library for production');

      return null;
    } catch (error: any) {
      console.log('❌ Speech-to-Text: FAILED');
      console.log('   Error:', error.message);
      return null;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   ElevenLabs API Test Suite            ║');
    console.log('╚════════════════════════════════════════╝\n');

    const results = {
      connectivity: false,
      voices: false,
      speechToText: false
    };

    // Test 1: API Connectivity
    results.connectivity = await this.testAPIConnectivity();

    if (!results.connectivity) {
      console.log('\n⚠️  API connectivity failed. Skipping remaining tests.');
      this.printSummary(results);
      return;
    }

    // Test 2: Available Voices
    results.voices = await this.testAvailableVoices();

    // Test 3: Speech-to-Text with sample audio
    const sampleAudioPath = path.join(__dirname, '../uploads/harvard.wav');
    const transcription = await this.testSpeechToText(sampleAudioPath);
    results.speechToText = transcription !== null;

    // Print summary
    this.printSummary(results);
  }

  private printSummary(results: any): void {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Test Summary                         ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`API Connectivity:  ${results.connectivity ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Available Voices:  ${results.voices ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Speech-to-Text:    ${results.speechToText ? '✅ PASS' : '❌ FAIL'}`);
    console.log('\n');
  }
}

// Run tests
const tester = new ElevenLabsTest();
tester.runAllTests().catch(console.error);

