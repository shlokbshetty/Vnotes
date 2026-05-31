/**
 * Tests for Google OAuth Configuration Module
 * 
 * Validates that the OAuth configuration loads and initializes correctly
 * with proper environment variable handling
 */

import { oauthConfig, initializeGoogleAuthClient, getGoogleAuthClient } from './oauth';

/**
 * Test OAuth configuration validation
 */
function testOAuthConfigValidation(): void {
  console.log('Testing OAuth configuration structure...');
  
  // Verify configuration object exists
  if (!oauthConfig) {
    throw new Error('oauthConfig is not defined');
  }

  // Verify endpoints are defined
  if (!oauthConfig.endpoints) {
    throw new Error('oauthConfig.endpoints is not defined');
  }

  // Verify all required endpoints are present
  const requiredEndpoints = ['authorization', 'token', 'jwks', 'revocation'];
  requiredEndpoints.forEach(endpoint => {
    if (!oauthConfig.endpoints[endpoint as keyof typeof oauthConfig.endpoints]) {
      throw new Error(`Missing endpoint: ${endpoint}`);
    }
  });

  // Verify scopes are defined
  if (!Array.isArray(oauthConfig.scopes) || oauthConfig.scopes.length === 0) {
    throw new Error('oauthConfig.scopes is not defined or empty');
  }

  console.log('✓ OAuth configuration structure is valid');
}

/**
 * Test that functions are exported correctly
 */
function testExportedFunctions(): void {
  console.log('Testing exported functions...');
  
  if (typeof initializeGoogleAuthClient !== 'function') {
    throw new Error('initializeGoogleAuthClient is not exported as a function');
  }

  if (typeof getGoogleAuthClient !== 'function') {
    throw new Error('getGoogleAuthClient is not exported as a function');
  }

  if (typeof oauthConfig.isValid !== 'function') {
    throw new Error('oauthConfig.isValid is not a function');
  }

  console.log('✓ All required functions are exported');
}

/**
 * Test that configuration loads from environment variables
 */
function testEnvironmentVariables(): void {
  console.log('Testing environment variable loading...');
  
  // Note: This test will pass even if env vars are empty,
  // as they are required but allowed to be empty for development
  
  // Verify the properties exist (even if empty)
  if (!('clientId' in oauthConfig)) {
    throw new Error('clientId property is missing from oauthConfig');
  }

  if (!('clientSecret' in oauthConfig)) {
    throw new Error('clientSecret property is missing from oauthConfig');
  }

  if (!('callbackUri' in oauthConfig)) {
    throw new Error('callbackUri property is missing from oauthConfig');
  }

  console.log('✓ Environment variables are loaded into configuration');
}

/**
 * Test OAuth endpoints
 */
function testOAuthEndpoints(): void {
  console.log('Testing OAuth endpoints...');
  
  const endpoints = oauthConfig.endpoints;

  // Verify all endpoints are HTTPS URLs
  Object.entries(endpoints).forEach(([name, url]) => {
    if (!url.startsWith('https://')) {
      throw new Error(`Endpoint ${name} is not using HTTPS: ${url}`);
    }
    console.log(`  ✓ ${name}: ${url}`);
  });
}

/**
 * Test scopes
 */
function testOAuthScopes(): void {
  console.log('Testing OAuth scopes...');
  
  const requiredScopes = ['openid', 'email', 'profile'];
  
  requiredScopes.forEach(scope => {
    if (!oauthConfig.scopes.includes(scope)) {
      throw new Error(`Required scope '${scope}' is missing from oauthConfig.scopes`);
    }
  });

  console.log(`✓ All required scopes are present: ${oauthConfig.scopes.join(', ')}`);
}

/**
 * Run all tests
 */
function runAllTests(): void {
  console.log('=== OAuth Configuration Module Tests ===\n');
  
  try {
    testOAuthConfigValidation();
    testExportedFunctions();
    testEnvironmentVariables();
    testOAuthEndpoints();
    testOAuthScopes();
    
    console.log('\n=== All tests passed! ===');
  } catch (error) {
    console.error('\n✗ Test failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export { testOAuthConfigValidation, testExportedFunctions, testEnvironmentVariables, testOAuthEndpoints, testOAuthScopes };
