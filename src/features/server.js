/**
 * Zero-Dependency Live HTTP Server & Hot Reload Engine
 *
 * Serves interactive HTML reports (PROJECT_STRUCTURE.html or CODE_GRAPH.html) with
 * real-time SSE (Server-Sent Events) live reloading as files in the workspace change.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { scan } = require('../core/scanner.js');
const { toHtml } = require('../exporters/html.js');
const { computeStats } = require('../core/stats.js');
const { generateUniversalGraph } = require('../core/universalParser.js');
const { toGraphVisualizerHtml } = require('../exporters/graphVisualizer.js');
const { watchDirectory } = require('./watcher.js');
const { openInBrowser } = require('../utils/opener.js');
const colors = require('../utils/colors.js');

const LIVE_RELOAD_SCRIPT = `
<script>
(function() {
  const evtSource = new EventSource('/events');
  evtSource.onmessage = function(e) {
    if (e.data === 'reload') {
      console.log('⚡ File change detected, reloading...');
      window.location.reload();
    }
  };
})();
</script>
`;

/**
 * Start the Live Development Server for a project directory.
 *
 * @param {string} dirPath
 * @param {Object} [options]
 * @param {number} [options.port=3000]
 * @param {boolean} [options.openHtml=true]
 * @param {string} [options.mode='report'] - 'report' | 'visualize'
 * @returns {Promise<{ server: http.Server, url: string }>}
 */
function startLiveServer(dirPath, options = {}) {
  const rootDir = path.resolve(dirPath);
  const port = options.port || 3000;
  const mode = options.mode || 'report';
  const openHtml = options.openHtml !== false;

  const clients = new Set();

  function generatePageHtml() {
    let rawHtml = '';
    if (mode === 'visualize') {
      const graphModel = generateUniversalGraph(rootDir);
      rawHtml = toGraphVisualizerHtml(graphModel);
    } else {
      const rootNode = scan(rootDir);
      const stats = computeStats(rootNode);
      rawHtml = toHtml(rootNode, stats);
    }

    if (rawHtml.includes('</body>')) {
      return rawHtml.replace('</body>', `${LIVE_RELOAD_SCRIPT}\n</body>`);
    }
    return rawHtml + LIVE_RELOAD_SCRIPT;
  }

  const server = http.createServer((req, res) => {
    if (req.url === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      res.write('retry: 1000\n\n');
      clients.add(res);

      req.on('close', () => {
        clients.delete(res);
      });
      return;
    }

    try {
      const content = generatePageHtml();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error: ' + err.message);
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(colors.success(`🚀 Live Server running at ${url}`));

      // Start file watcher
      watchDirectory(rootDir, () => {
        console.log(colors.info('🔄 Change detected! Triggering live reload...'));
        for (const client of clients) {
          client.write('data: reload\n\n');
        }
      });

      if (openHtml) {
        openInBrowser(url);
      }

      resolve({ server, url });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        startLiveServer(dirPath, { ...options, port: port + 1 }).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

module.exports = { startLiveServer };
