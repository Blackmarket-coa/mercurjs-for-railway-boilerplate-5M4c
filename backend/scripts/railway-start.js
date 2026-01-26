#!/usr/bin/env node
/**
 * Railway-Optimized Startup Script
 *
 * This script optimizes the startup sequence for Railway deployment:
 * 1. Sets NODE_OPTIONS for memory management
 * 2. Runs database migrations
 * 3. Conditionally seeds data (skipped if SKIP_SEED=true or data exists)
 * 4. Initializes backend
 * 5. Starts the MedusaJS server
 *
 * Environment Variables:
 * - SKIP_SEED: Set to "true" to skip seeding entirely
 * - SKIP_MIGRATIONS: Set to "true" to skip migrations (use for faster restarts)
 * - NODE_MEMORY_MB: Memory limit in MB (default: 512)
 * - RAILWAY_ENVIRONMENT: Detected automatically by Railway
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

// Configuration
const NODE_MEMORY_MB = process.env.NODE_MEMORY_MB || '512';
const SKIP_SEED = process.env.SKIP_SEED === 'true';
const SKIP_MIGRATIONS = process.env.SKIP_MIGRATIONS === 'true';
const IS_RAILWAY = !!process.env.RAILWAY_ENVIRONMENT;

// Set Node.js options for Railway optimization
const nodeOptions = [
  `--max-old-space-size=${NODE_MEMORY_MB}`,
  '--experimental-vm-modules',
  // Optimize garbage collection for server workloads
  '--expose-gc',
  // Reduce memory fragmentation
  '--optimize-for-size',
].join(' ');

// Merge with existing NODE_OPTIONS if present
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS
  ? `${process.env.NODE_OPTIONS} ${nodeOptions}`
  : nodeOptions;

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '\x1b[34m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
  }[type] || '[LOG]';

  console.log(`${timestamp} ${prefix} ${message}`);
}

function runCommand(command, description) {
  log(`Starting: ${description}`);
  const startTime = Date.now();

  try {
    execSync(command, {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd(),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Completed: ${description} (${duration}s)`, 'success');
    return true;
  } catch (error) {
    log(`Failed: ${description} - ${error.message}`, 'error');
    return false;
  }
}

async function main() {
  log('='.repeat(60));
  log('Railway-Optimized Startup Sequence');
  log('='.repeat(60));
  log(`Environment: ${IS_RAILWAY ? 'Railway' : 'Local'}`);
  log(`Memory Limit: ${NODE_MEMORY_MB}MB`);
  log(`Skip Seed: ${SKIP_SEED}`);
  log(`Skip Migrations: ${SKIP_MIGRATIONS}`);
  log('='.repeat(60));

  const startTime = Date.now();

  // Step 1: Database Migrations
  if (!SKIP_MIGRATIONS) {
    if (!runCommand('npx medusa db:migrate --execute-safe-links', 'Database migrations')) {
      log('Migrations failed, but continuing startup...', 'warn');
    }
  } else {
    log('Skipping migrations (SKIP_MIGRATIONS=true)', 'warn');
  }

  // Step 2: Conditional Seeding
  if (!SKIP_SEED) {
    if (!runCommand('pnpm seed:if-needed', 'Conditional seeding')) {
      log('Seeding failed, but continuing startup...', 'warn');
    }
  } else {
    log('Skipping seed (SKIP_SEED=true)', 'warn');
  }

  // Step 3: Initialize Backend
  if (!runCommand('init-backend', 'Backend initialization')) {
    log('Backend initialization failed', 'error');
    process.exit(1);
  }

  const setupDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  log('='.repeat(60));
  log(`Setup completed in ${setupDuration}s`, 'success');
  log('Starting MedusaJS server...');
  log('='.repeat(60));

  // Step 4: Start MedusaJS Server
  const serverProcess = spawn('npx', ['medusa', 'start'], {
    stdio: 'inherit',
    env: process.env,
    cwd: path.join(process.cwd(), '.medusa', 'server'),
    shell: true,
  });

  // Handle server process signals
  serverProcess.on('error', (error) => {
    log(`Server failed to start: ${error.message}`, 'error');
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      log(`Server exited with code ${code}`, 'error');
    }
    process.exit(code || 0);
  });

  // Forward signals to server process
  ['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, () => {
      log(`Received ${signal}, forwarding to server...`);
      serverProcess.kill(signal);
    });
  });
}

main().catch((error) => {
  log(`Startup failed: ${error.message}`, 'error');
  process.exit(1);
});
