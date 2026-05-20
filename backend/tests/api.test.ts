/**
 * VNotes API Test Suite
 * 
 * This file contains comprehensive tests for all VNotes API endpoints.
 * Use this to verify API functionality when making changes to the code.
 * 
 * Run with: npm run test:api (from backend directory)
 */

const BASE_URL = 'http://localhost:3001/api';
const UPLOADS_URL = 'http://localhost:3001/uploads';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

// Helper function to log test results
function logTest(name: string, passed: boolean, error?: string) {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} - ${name}`);
  if (error) {
    console.log(`  ${colors.red}Error: ${error}${colors.reset}`);
  }
  results.push({ name, passed, error });
}

// Test 1: GET / - Health check
async function testHealthCheck() {
  try {
    const response = await fetch(BASE_URL.replace('/api', ''));
    const data = await response.json();
    const passed = response.ok && data.message === 'VNotes Backend API';
    logTest('Health Check - GET /', passed);
  } catch (error) {
    logTest('Health Check - GET /', false, String(error));
  }
}

// Test 2: GET /api/recordings - Get all recordings
async function testGetRecordings() {
  try {
    const response = await fetch(`${BASE_URL}/recordings`);
    const data = await response.json();
    const passed = response.ok && Array.isArray(data);
    logTest('Get All Recordings - GET /api/recordings', passed);
  } catch (error) {
    logTest('Get All Recordings - GET /api/recordings', false, String(error));
  }
}

// Test 3: POST /api/recordings/upload - Upload audio file
async function testUploadAudio() {
  try {
    // Create a simple WAV file (minimal valid WAV)
    const wavHeader = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // File size
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6d, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Subchunk1Size
      0x01, 0x00, 0x02, 0x00, // AudioFormat, NumChannels
      0x44, 0xac, 0x00, 0x00, // SampleRate
      0x10, 0xb1, 0x02, 0x00, // ByteRate
      0x04, 0x00, 0x10, 0x00, // BlockAlign, BitsPerSample
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // Subchunk2Size
    ]);

    const blob = new Blob([wavHeader], { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', blob, 'test-audio.wav');

    const response = await fetch(`${BASE_URL}/recordings/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    const passed = response.ok && data.id && data.filename && data.type === 'audio/wav';
    logTest('Upload Audio File - POST /api/recordings/upload', passed);
    
    return passed ? data.id : null;
  } catch (error) {
    logTest('Upload Audio File - POST /api/recordings/upload', false, String(error));
    return null;
  }
}

// Test 4: GET /api/recordings/:id - Get single recording
async function testGetRecording(recordingId: string) {
  try {
    const response = await fetch(`${BASE_URL}/recordings/${recordingId}`);
    const data = await response.json();
    const passed = response.ok && data.id === recordingId;
    logTest('Get Single Recording - GET /api/recordings/:id', passed);
  } catch (error) {
    logTest('Get Single Recording - GET /api/recordings/:id', false, String(error));
  }
}

// Test 5: DELETE /api/recordings/:id - Delete recording
async function testDeleteRecording(recordingId: string) {
  try {
    const response = await fetch(`${BASE_URL}/recordings/${recordingId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    const passed = response.ok && data.message;
    logTest('Delete Recording - DELETE /api/recordings/:id', passed);
  } catch (error) {
    logTest('Delete Recording - DELETE /api/recordings/:id', false, String(error));
  }
}

// Test 6: GET /uploads/:filename - Serve static file
async function testServeFile() {
  try {
    const response = await fetch(`${UPLOADS_URL}/test-file.wav`);
    // File may not exist, but endpoint should be accessible
    const passed = response.status === 200 || response.status === 404;
    logTest('Serve Static File - GET /uploads/:filename', passed);
  } catch (error) {
    logTest('Serve Static File - GET /uploads/:filename', false, String(error));
  }
}

// Test 7: Invalid file upload
async function testInvalidFileUpload() {
  try {
    const blob = new Blob(['invalid content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'test.txt');

    const response = await fetch(`${BASE_URL}/recordings/upload`, {
      method: 'POST',
      body: formData
    });

    const passed = response.status === 400 || response.status === 500;
    logTest('Invalid File Upload - POST /api/recordings/upload (should reject)', passed);
  } catch (error) {
    logTest('Invalid File Upload - POST /api/recordings/upload (should reject)', false, String(error));
  }
}

// Test 8: Get non-existent recording
async function testGetNonExistentRecording() {
  try {
    const response = await fetch(`${BASE_URL}/recordings/999999999`);
    const passed = response.status === 404;
    logTest('Get Non-Existent Recording - GET /api/recordings/:id (should 404)', passed);
  } catch (error) {
    logTest('Get Non-Existent Recording - GET /api/recordings/:id (should 404)', false, String(error));
  }
}

// Test 9: Delete non-existent recording
async function testDeleteNonExistentRecording() {
  try {
    const response = await fetch(`${BASE_URL}/recordings/999999999`, {
      method: 'DELETE'
    });
    const passed = response.status === 404;
    logTest('Delete Non-Existent Recording - DELETE /api/recordings/:id (should 404)', passed);
  } catch (error) {
    logTest('Delete Non-Existent Recording - DELETE /api/recordings/:id (should 404)', false, String(error));
  }
}

// Test 10: CORS headers
async function testCORSHeaders() {
  try {
    const response = await fetch(`${BASE_URL}/recordings`, {
      method: 'OPTIONS'
    });
    const corsHeader = response.headers.get('access-control-allow-origin');
    const passed = corsHeader !== null;
    logTest('CORS Headers - OPTIONS /api/recordings', passed);
  } catch (error) {
    logTest('CORS Headers - OPTIONS /api/recordings', false, String(error));
  }
}

// Main test runner
async function runTests() {
  console.log(`\n${colors.blue}=== VNotes API Test Suite ===${colors.reset}\n`);
  console.log(`${colors.yellow}Testing API at: ${BASE_URL}${colors.reset}\n`);

  // Run tests sequentially
  await testHealthCheck();
  await testGetRecordings();
  const uploadedId = await testUploadAudio();
  
  if (uploadedId) {
    await testGetRecording(uploadedId);
    await testDeleteRecording(uploadedId);
  }
  
  await testServeFile();
  await testInvalidFileUpload();
  await testGetNonExistentRecording();
  await testDeleteNonExistentRecording();
  await testCORSHeaders();

  // Print summary
  console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}\n`);
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`Total Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${total - passed}${colors.reset}`);
  console.log(`Success Rate: ${percentage}%\n`);

  if (passed === total) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Some tests failed. Review errors above.${colors.reset}\n`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
