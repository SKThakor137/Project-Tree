'use strict';

const path = require('path');
const http = require('http');
const { startLiveServer } = require('../src/features/server.js');

console.log('🧪 Testing Zero-Dependency Live HTTP Server...');

const rootDir = path.join(__dirname, '..');

startLiveServer(rootDir, { port: 3899, openHtml: false }).then(({ server, url }) => {
  if (!url.startsWith('http://localhost:')) {
    console.error('❌ startLiveServer returned invalid URL:', url);
    process.exit(1);
  }

  // Request HTML from server
  http.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (!data.includes('DOCTYPE html') || !data.includes('LIVE_RELOAD') && !data.includes('EventSource')) {
        console.error('❌ HTTP server response missing HTML or live reload script');
        process.exit(1);
      }
      console.log('  ✅ HTTP Live Server responded with HTML & Live Reload SSE client');
      server.close(() => {
        console.log('✨ Live Server tests passed!\n');
        process.exit(0);
      });
    });
  }).on('error', (err) => {
    console.error('❌ HTTP Request failed:', err);
    process.exit(1);
  });
}).catch(err => {
  console.error('❌ Failed to start Live Server:', err);
  process.exit(1);
});
