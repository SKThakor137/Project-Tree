/**
 * Graph JSON Exporter
 *
 * Exports the Universal Graph Model as a complete JSON file containing
 * all data needed to fully reconstruct the interactive visualization.
 */
'use strict';

/**
 * Export graph model to a complete JSON string.
 * @param {Object} graphModel - Output from generateUniversalGraph()
 * @param {number} [indent=2] - JSON indentation
 * @returns {string} JSON string
 */
function toGraphJson(graphModel, indent = 2) {
  if (!graphModel) {
    return JSON.stringify({ error: 'No graph data available' }, null, indent);
  }

  const output = {
    version: '1.0.0',
    generator: 'project-tree-md',
    ...graphModel,
  };

  return JSON.stringify(output, null, indent);
}

/**
 * Parse a graph JSON string back into a graph model object.
 * @param {string} jsonStr
 * @returns {Object} graph model
 */
function fromGraphJson(jsonStr) {
  const data = JSON.parse(jsonStr);
  if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error('Invalid graph JSON: must contain nodes[] and edges[]');
  }
  return data;
}

module.exports = { toGraphJson, fromGraphJson };
