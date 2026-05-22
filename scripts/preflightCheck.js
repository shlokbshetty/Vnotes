#!/usr/bin/env node

/**
 * Preflight Check Script
 * Validates system setup before running the application
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const CHECKS = {
  BACKEND_RUNNING: 'Backend Server (port 3001)',
  UPLOADS_FOLDER: 'Uploads Folder',
  RECORDINGS_JSON: 'Recordings Metadata File',
  ENV_FILE: 'Environment Configuration'
};

const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m'
};

const log = (color, message) => {
  console.log(`${color}${message}${COLORS.RESET}`);
};

const checkBackendRunning = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

const checkUploadsFolder = () => {
  const uploadsPath = path.join(__dirname, '../backend/uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    return true;
  }
  return true;
};

const checkRecordingsJson = () => {
  const recordingsPath = path.join(__dirname, '../backend/src/data/recordings.json');
  if (!fs.existsSync(recordingsPath)) {
    fs.writeFileSync(recordingsPath, JSON.stringify([], null, 2));
    return true;
  }
  return true;
};

const checkEnvFile = () => {
  const envPath = path.join(__dirname, '../.env');
  return fs.existsSync(envPath);
};

const runChecks = async () => {
  console.log('\n');
  log(COLORS.BLUE, '╔════════════════════════════════════════╗');
  log(COLORS.BLUE, '║   VNotes - System Preflight Check      ║');
  log(COLORS.BLUE, '╚════════════════════════════════════════╝\n');

  const results = {};
  let allPassed = true;

  // Check 1: Uploads Folder
  log(COLORS.YELLOW, `Checking ${CHECKS.UPLOADS_FOLDER}...`);
  results.uploadsFolder = checkUploadsFolder();
  if (results.uploadsFolder) {
    log(COLORS.GREEN, `✓ ${CHECKS.UPLOADS_FOLDER} - OK\n`);
  } else {
    log(COLORS.RED, `✗ ${CHECKS.UPLOADS_FOLDER} - FAILED\n`);
    allPassed = false;
  }

  // Check 2: Recordings JSON
  log(COLORS.YELLOW, `Checking ${CHECKS.RECORDINGS_JSON}...`);
  results.recordingsJson = checkRecordingsJson();
  if (results.recordingsJson) {
    log(COLORS.GREEN, `✓ ${CHECKS.RECORDINGS_JSON} - OK\n`);
  } else {
    log(COLORS.RED, `✗ ${CHECKS.RECORDINGS_JSON} - FAILED\n`);
    allPassed = false;
  }

  // Check 3: Environment File
  log(COLORS.YELLOW, `Checking ${CHECKS.ENV_FILE}...`);
  results.envFile = checkEnvFile();
  if (results.envFile) {
    log(COLORS.GREEN, `✓ ${CHECKS.ENV_FILE} - OK\n`);
  } else {
    log(COLORS.YELLOW, `⚠ ${CHECKS.ENV_FILE} - NOT FOUND (using defaults)\n`);
  }

  // Check 4: Backend Running
  log(COLORS.YELLOW, `Checking ${CHECKS.BACKEND_RUNNING}...`);
  results.backendRunning = await checkBackendRunning();
  if (results.backendRunning) {
    log(COLORS.GREEN, `✓ ${CHECKS.BACKEND_RUNNING} - OK\n`);
  } else {
    log(COLORS.RED, `✗ ${CHECKS.BACKEND_RUNNING} - NOT RUNNING\n`);
    log(COLORS.YELLOW, `  Start backend with: cd backend && npm run dev\n`);
    allPassed = false;
  }

  // Summary
  log(COLORS.BLUE, '╔════════════════════════════════════════╗');
  if (allPassed) {
    log(COLORS.GREEN, '║   ✓ All checks passed! Ready to go.   ║');
  } else {
    log(COLORS.RED, '║   ✗ Some checks failed. See above.    ║');
  }
  log(COLORS.BLUE, '╚════════════════════════════════════════╝\n');

  process.exit(allPassed ? 0 : 1);
};

runChecks().catch((error) => {
  log(COLORS.RED, `Error during preflight check: ${error.message}`);
  process.exit(1);
});
