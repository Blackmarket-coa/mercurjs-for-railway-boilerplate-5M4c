const https = require('https');
const http = require('http');

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.VITE_MEDUSA_BACKEND_URL;

if (!BACKEND_URL) {
  console.error('❌ Error: MEDUSA_BACKEND_URL or VITE_MEDUSA_BACKEND_URL environment variable is required');
  process.exit(1);
}

const maxAttempts = 240; // 20 minutes
let attempts = 0;

async function checkBackend() {
  const url = `${BACKEND_URL}/key-exchange`;
  const client = url.startsWith('https') ? https : http;
  
  return new Promise((resolve) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✓ Backend is ready at ${BACKEND_URL}`);
        process.exit(0);
      } else {
        resolve(false);
      }
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function wait() {
  console.log(`Waiting for backend at ${BACKEND_URL}...`);
  
  const interval = setInterval(async () => {
    attempts++;
    
    if (attempts >= maxAttempts) {
      console.error(`✗ Backend not available after ${attempts * 5} seconds`);
      process.exit(1);
    }
    
    console.log(`Checking backend... (${attempts * 5}s elapsed)`);
    await checkBackend();
  }, 5000);
}

wait();
