/**
 * 3D Interactive Graph Visualizer — Unified Exporter Alias
 *
 * Re-exports the unified 2D/3D interactive visualizer for complete
 * backward compatibility. Outputs a single standalone HTML with
 * seamless 2D/3D mode toggling and lazy-loaded 3D engine.
 */
'use strict';

const { toGraphVisualizerHtml } = require('./graphVisualizer');

module.exports = {
  toGraph3dVisualizerHtml: toGraphVisualizerHtml
};
