# VNotes API Tests

Comprehensive test suite for VNotes backend API endpoints.

## Overview

This test suite validates all API endpoints and ensures they work correctly. Use this when making changes to the code to verify nothing is broken.

## Test Coverage

- ✅ Health check endpoint
- ✅ Get all recordings
- ✅ Upload audio/video files
- ✅ Get single recording
- ✅ Delete recording
- ✅ Serve static files
- ✅ Invalid file rejection
- ✅ 404 error handling
- ✅ CORS headers

## Running Tests

### Prerequisites

1. Backend server must be running:
```bash
cd backend
npm run dev
```

2. Server should be accessible at `http://localhost:3001`

### Run Tests

From the backend directory:

```bash
# Using Node.js directly
node -r ts-node/register tests/api.test.ts

# Or using npx
npx ts-node tests/api.test.ts
```

### Expected Output

```
=== VNotes API Test Suite ===

Testing API at: http://localhost:3001/api

✓ PASS - Health Check - GET /
✓ PASS - Get All Recordings - GET /api/recordings
✓ PASS - Upload Audio File - POST /api/recordings/upload
✓ PASS - Get Single Recording - GET /api/recordings/:id
✓ PASS - Delete Recording - DELETE /api/recordings/:id
✓ PASS - Serve Static File - GET /uploads/:filename
✓ PASS - Invalid File Upload - POST /api/recordings/upload (should reject)
✓ PASS - Get Non-Existent Recording - GET /api/recordings/:id (should 404)
✓ PASS - Delete Non-Existent Recording - DELETE /api/recordings/:id (should 404)
✓ PASS - CORS Headers - OPTIONS /api/recordings

=== Test Summary ===

Total Tests: 10
Passed: 10
Failed: 0
Success Rate: 100%

✓ All tests passed!
```

## API Endpoints Tested

### 1. Health Check
- **Endpoint**: `GET /`
- **Expected**: Returns `{ message: 'VNotes Backend API' }`
- **Status**: 200

### 2. Get All Recordings
- **Endpoint**: `GET /api/recordings`
- **Expected**: Returns array of recordings
- **Status**: 200

### 3. Upload File
- **Endpoint**: `POST /api/recordings/upload`
- **Body**: FormData with file
- **Accepted Types**: audio/*, video/*
- **Max Size**: 500MB
- **Expected**: Returns recording object with metadata
- **Status**: 200

### 4. Get Single Recording
- **Endpoint**: `GET /api/recordings/:id`
- **Expected**: Returns recording object
- **Status**: 200 or 404

### 5. Delete Recording
- **Endpoint**: `DELETE /api/recordings/:id`
- **Expected**: Returns success message and deletes file
- **Status**: 200 or 404

### 6. Serve File
- **Endpoint**: `GET /uploads/:filename`
- **Expected**: Returns file or 404
- **Status**: 200 or 404

## Supported File Formats

### Audio
- `.wav` - WAV format
- `.mp3` - MPEG Audio
- `.m4a` - MPEG-4 Audio

### Video
- `.mp4` - MPEG-4 Video
- `.mkv` - Matroska Video
- `.webm` - WebM Video

## Troubleshooting

### Tests Fail - Connection Refused
- Ensure backend server is running: `npm run dev`
- Check server is on port 3001
- Verify no firewall blocking localhost:3001

### Tests Fail - Invalid File Upload
- Check multer configuration in `recordingRoutes.ts`
- Verify MIME type is in allowed list
- Check file size doesn't exceed 500MB limit

### Tests Fail - File Not Found
- Ensure `/backend/uploads/` directory exists
- Check file permissions
- Verify multer storage configuration

## Adding New Tests

To add new tests:

1. Create a new async function in `api.test.ts`
2. Use `logTest()` to record results
3. Add function call to `runTests()`

Example:
```typescript
async function testNewEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/new-endpoint`);
    const passed = response.ok;
    logTest('New Endpoint - GET /api/new-endpoint', passed);
  } catch (error) {
    logTest('New Endpoint - GET /api/new-endpoint', false, String(error));
  }
}
```

## Test Results Interpretation

- **✓ PASS**: Endpoint works as expected
- **✗ FAIL**: Endpoint returned unexpected result or error
- **Error**: Network error or exception occurred

## Performance Notes

- Tests run sequentially
- Each test waits for previous to complete
- Total runtime: ~2-5 seconds
- No data persists between test runs

## Maintenance

When making changes to API:

1. Run tests to verify nothing broke
2. Add new tests for new endpoints
3. Update this README with changes
4. Commit tests with code changes

## Support

For issues or questions:
1. Check test output for specific error
2. Review API endpoint implementation
3. Verify server is running correctly
4. Check network connectivity
