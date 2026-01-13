#!/usr/bin/env node
/**
 * Setup Verification Script
 * Run this to check if your About Town environment is configured correctly
 */

import { readFileSync, existsSync } from 'fs';

// Simple .env parser (to avoid dependency on dotenv package)
function loadEnv() {
  if (!existsSync('.env')) return {};

  const env = {};
  const content = readFileSync('.env', 'utf-8');

  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      env[key.trim()] = value;
    }
  });

  return env;
}

const env = loadEnv();

const checks = {
  nodeVersion: false,
  envFile: false,
  legiScanConfigured: false,
  databaseConfigured: false,
  dependencies: false
};

console.log('🔍 About Town - Setup Verification\n');
console.log('=' .repeat(50) + '\n');

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
checks.nodeVersion = majorVersion >= 18;
console.log(`✓ Node.js version: ${nodeVersion} ${checks.nodeVersion ? '✅' : '❌ (Requires v18+)'}`);

// Check .env file exists
checks.envFile = existsSync('.env');
console.log(`✓ .env file: ${checks.envFile ? '✅ Found' : '❌ Not found'}`);

// Check LegiScan API key
checks.legiScanConfigured = !!env.LEGISCAN_API_KEY;
console.log(`✓ LegiScan API Key: ${checks.legiScanConfigured ? '✅ Configured' : '⚠️  Not set (will use sample data)'}`);

// Check Database URL
checks.databaseConfigured = !!env.DATABASE_URL;
console.log(`✓ Database URL: ${checks.databaseConfigured ? '✅ Configured' : '⚠️  Not set (limited features)'}`);

// Check if dependencies are installed
checks.dependencies = existsSync('node_modules');
console.log(`✓ Dependencies: ${checks.dependencies ? '✅ Installed' : '❌ Run npm install'}`);

console.log('\n' + '=' .repeat(50) + '\n');

// Summary
const criticalIssues = !checks.nodeVersion || !checks.envFile || !checks.dependencies;
const warnings = !checks.legiScanConfigured || !checks.databaseConfigured;

if (criticalIssues) {
  console.log('❌ Critical Issues Found!\n');
  if (!checks.nodeVersion) console.log('   - Upgrade Node.js to v18 or higher');
  if (!checks.envFile) console.log('   - Create .env file (copy from .env.example)');
  if (!checks.dependencies) console.log('   - Run: npm install');
  console.log('\nPlease fix these issues before running the app.\n');
  process.exit(1);
} else if (warnings) {
  console.log('⚠️  Setup Complete with Warnings\n');
  if (!checks.legiScanConfigured) {
    console.log('   - LegiScan API not configured. App will use sample bill data.');
    console.log('   - To get real data, add LEGISCAN_API_KEY to .env');
    console.log('   - Sign up at: https://legiscan.com/signup\n');
  }
  if (!checks.databaseConfigured) {
    console.log('   - Database not configured. Some features will be limited.');
    console.log('   - To enable all features, add DATABASE_URL to .env');
    console.log('   - See SETUP_GUIDE.md for database options\n');
  }
  console.log('✅ You can run the app with: npm run dev\n');
  process.exit(0);
} else {
  console.log('✅ All checks passed! Your environment is fully configured.\n');
  console.log('Ready to run:\n');
  console.log('   npm run dev      # Start development server');
  console.log('   npm run build    # Build for production\n');

  if (checks.databaseConfigured) {
    console.log('Database commands:');
    console.log('   npm run db:push     # Apply schema to database');
    console.log('   npm run db:studio   # Open database GUI\n');
  }

  process.exit(0);
}
