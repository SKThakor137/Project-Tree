/**
 * Universal Graph Model — framework-agnostic code relationship data schema.
 *
 * This is the core data model that every language parser outputs into.
 * The visualization engine consumes this model and remains identical
 * regardless of the source language or framework.
 *
 * Architecture:  Parser Layer → Universal Graph Model → Visualization Engine
 */
'use strict';

// ─── Node Type Definitions ───────────────────────────────────────────────────

const NODE_TYPES = {
  APPLICATION:    { type: 'APPLICATION',    icon: '🚀', label: 'Application',       color: '#58a6ff' },
  MODULE:         { type: 'MODULE',         icon: '📦', label: 'Module',             color: '#8b949e' },
  FOLDER:         { type: 'FOLDER',         icon: '📁', label: 'Folder',             color: '#8b949e' },
  FILE:           { type: 'FILE',           icon: '📄', label: 'File',               color: '#c9d1d9' },
  COMPONENT:      { type: 'COMPONENT',      icon: '🧩', label: 'Component',          color: '#3fb950' },
  PAGE:           { type: 'PAGE',           icon: '💻', label: 'Page',               color: '#58a6ff' },
  LAYOUT:         { type: 'LAYOUT',         icon: '📋', label: 'Layout',             color: '#6cb6ff' },
  HOOK:           { type: 'HOOK',           icon: '🪝', label: 'Hook',               color: '#d2a8ff' },
  CONTEXT:        { type: 'CONTEXT',        icon: '🔮', label: 'Context',            color: '#bc8cff' },
  PROVIDER:       { type: 'PROVIDER',       icon: '🏭', label: 'Provider',           color: '#a371f7' },
  SERVICE:        { type: 'SERVICE',        icon: '💼', label: 'Service',            color: '#d29922' },
  CONTROLLER:     { type: 'CONTROLLER',     icon: '⚙️',  label: 'Controller',         color: '#e3b341' },
  MODEL:          { type: 'MODEL',          icon: '🗄️', label: 'Model',              color: '#f85149' },
  REPOSITORY:     { type: 'REPOSITORY',     icon: '🗃️', label: 'Repository',         color: '#da3633' },
  STORE:          { type: 'STORE',          icon: '🏪', label: 'Store',              color: '#f0883e' },
  DATABASE_TABLE: { type: 'DATABASE_TABLE', icon: '📊', label: 'Database Table',     color: '#f85149' },
  COLLECTION:     { type: 'COLLECTION',     icon: '📚', label: 'Collection',         color: '#db6d28' },
  API:            { type: 'API',            icon: '🌐', label: 'API Endpoint',       color: '#58a6ff' },
  GRAPHQL:        { type: 'GRAPHQL',        icon: '◈',  label: 'GraphQL',            color: '#e535ab' },
  FUNCTION:       { type: 'FUNCTION',       icon: '⚡', label: 'Function',           color: '#79c0ff' },
  CLASS:          { type: 'CLASS',          icon: '🏛️', label: 'Class',              color: '#d2a8ff' },
  INTERFACE:      { type: 'INTERFACE',      icon: '📐', label: 'Interface',          color: '#a5d6ff' },
  ENUM:           { type: 'ENUM',           icon: '🔢', label: 'Enum',               color: '#7ee787' },
  UTILITY:        { type: 'UTILITY',        icon: '🛠️', label: 'Utility',            color: '#8b949e' },
  PACKAGE:        { type: 'PACKAGE',        icon: '📦', label: 'Package',            color: '#f0883e' },
  ASSET:          { type: 'ASSET',          icon: '🎨', label: 'Asset',              color: '#f778ba' },
  ENVIRONMENT:    { type: 'ENVIRONMENT',    icon: '🌍', label: 'Environment',        color: '#7ee787' },
  MIDDLEWARE:     { type: 'MIDDLEWARE',      icon: '🛡️', label: 'Middleware',         color: '#bc8cff' },
  JOB:            { type: 'JOB',            icon: '⏰', label: 'Job',                color: '#d29922' },
  QUEUE:          { type: 'QUEUE',          icon: '📬', label: 'Queue',              color: '#e3b341' },
  WORKER:         { type: 'WORKER',         icon: '👷', label: 'Worker',             color: '#d29922' },
  EVENT:          { type: 'EVENT',          icon: '📡', label: 'Event',              color: '#79c0ff' },
  LISTENER:       { type: 'LISTENER',       icon: '👂', label: 'Listener',           color: '#6cb6ff' },
  ROUTE:          { type: 'ROUTE',          icon: '🛤️', label: 'Route',              color: '#58a6ff' },
  TEST:           { type: 'TEST',           icon: '🧪', label: 'Test',               color: '#7ee787' },
  DOCUMENTATION:  { type: 'DOCUMENTATION',  icon: '📝', label: 'Documentation',      color: '#8b949e' },
  CONFIG:         { type: 'CONFIG',         icon: '⚙️',  label: 'Configuration',      color: '#8b949e' },
  GUARD:          { type: 'GUARD',          icon: '🔒', label: 'Guard',              color: '#f85149' },
  INTERCEPTOR:    { type: 'INTERCEPTOR',    icon: '🔀', label: 'Interceptor',        color: '#bc8cff' },
  PIPE:           { type: 'PIPE',           icon: '🔧', label: 'Pipe',               color: '#79c0ff' },
  DIRECTIVE:      { type: 'DIRECTIVE',      icon: '📌', label: 'Directive',          color: '#d2a8ff' },
  WIDGET:         { type: 'WIDGET',         icon: '🧱', label: 'Widget',             color: '#3fb950' },
  BLOC:           { type: 'BLOC',           icon: '🧊', label: 'BLoC',               color: '#58a6ff' },
  CUBIT:          { type: 'CUBIT',          icon: '🎲', label: 'Cubit',              color: '#6cb6ff' },
  ENTRY:          { type: 'ENTRY',          icon: '🚀', label: 'Entry Point',        color: '#3fb950' },
  CUSTOM:         { type: 'CUSTOM',         icon: '🔷', label: 'Custom',             color: '#8b949e' },
};

// ─── Edge / Relationship Type Definitions ────────────────────────────────────

const EDGE_TYPES = {
  // Structural
  PARENT_CHILD:       { type: 'PARENT_CHILD',       label: 'Parent → Child',       color: '#58a6ff', style: 'solid' },
  IMPORTS:            { type: 'IMPORTS',             label: 'Imports',              color: '#8b949e', style: 'solid' },
  IMPORTED_BY:        { type: 'IMPORTED_BY',         label: 'Imported By',          color: '#6e7681', style: 'dashed' },
  EXPORTS:            { type: 'EXPORTS',             label: 'Exports',              color: '#7ee787', style: 'solid' },

  // React / Frontend
  HOOK_USAGE:         { type: 'HOOK_USAGE',          label: 'Hook Usage',           color: '#d2a8ff', style: 'solid' },
  CONTEXT_USAGE:      { type: 'CONTEXT_USAGE',       label: 'Context Usage',        color: '#bc8cff', style: 'dashed' },
  PROVIDER_USAGE:     { type: 'PROVIDER_USAGE',      label: 'Provider Usage',       color: '#a371f7', style: 'solid' },
  PROPS:              { type: 'PROPS',               label: 'Props',                color: '#79c0ff', style: 'solid' },
  EVENTS:             { type: 'EVENTS',              label: 'Events',               color: '#79c0ff', style: 'dotted' },

  // State Management
  STORE_USAGE:        { type: 'STORE_USAGE',         label: 'Store Usage',          color: '#f0883e', style: 'solid' },
  REDUX:              { type: 'REDUX',               label: 'Redux',                color: '#764abc', style: 'solid' },
  ZUSTAND:            { type: 'ZUSTAND',             label: 'Zustand',              color: '#f0883e', style: 'solid' },
  MOBX:               { type: 'MOBX',                label: 'MobX',                 color: '#ff9955', style: 'solid' },
  PINIA:              { type: 'PINIA',               label: 'Pinia',                color: '#ffd859', style: 'solid' },
  VUEX:               { type: 'VUEX',                label: 'Vuex',                 color: '#42b883', style: 'solid' },
  RIVERPOD:           { type: 'RIVERPOD',            label: 'Riverpod',             color: '#0553B1', style: 'solid' },
  BLOC_PATTERN:       { type: 'BLOC_PATTERN',        label: 'BLoC',                 color: '#58a6ff', style: 'solid' },
  CUBIT_PATTERN:      { type: 'CUBIT_PATTERN',       label: 'Cubit',                color: '#6cb6ff', style: 'solid' },

  // Backend
  SERVICE_USAGE:      { type: 'SERVICE_USAGE',       label: 'Service Usage',        color: '#d29922', style: 'solid' },
  REPOSITORY_USAGE:   { type: 'REPOSITORY_USAGE',    label: 'Repository Usage',     color: '#da3633', style: 'solid' },
  DEPENDENCY_INJECT:  { type: 'DEPENDENCY_INJECT',   label: 'Dependency Injection', color: '#a371f7', style: 'dashed' },
  MIDDLEWARE_USAGE:    { type: 'MIDDLEWARE_USAGE',    label: 'Middleware',            color: '#bc8cff', style: 'solid' },
  ROUTE_HANDLER:      { type: 'ROUTE_HANDLER',       label: 'Route Handler',        color: '#58a6ff', style: 'solid' },

  // Data
  API_CALL:           { type: 'API_CALL',            label: 'API Call',             color: '#58a6ff', style: 'dashed' },
  GRAPHQL_QUERY:      { type: 'GRAPHQL_QUERY',       label: 'GraphQL Query',        color: '#e535ab', style: 'dashed' },
  DATABASE_READ:      { type: 'DATABASE_READ',       label: 'Database Read',        color: '#3fb950', style: 'solid' },
  DATABASE_WRITE:     { type: 'DATABASE_WRITE',      label: 'Database Write',       color: '#f85149', style: 'solid' },

  // Architecture
  EXTENDS:            { type: 'EXTENDS',             label: 'Extends',              color: '#d2a8ff', style: 'solid' },
  IMPLEMENTS:         { type: 'IMPLEMENTS',          label: 'Implements',           color: '#a5d6ff', style: 'dashed' },
  COMPOSES:           { type: 'COMPOSES',            label: 'Composes',             color: '#79c0ff', style: 'solid' },
  DECORATES:          { type: 'DECORATES',           label: 'Decorates',            color: '#d2a8ff', style: 'dotted' },

  // Infrastructure
  AUTHENTICATION:     { type: 'AUTHENTICATION',      label: 'Authentication',       color: '#f85149', style: 'solid' },
  GUARD_USAGE:        { type: 'GUARD_USAGE',         label: 'Guard',                color: '#f85149', style: 'dashed' },
  INTERCEPTOR_USAGE:  { type: 'INTERCEPTOR_USAGE',   label: 'Interceptor',          color: '#bc8cff', style: 'dashed' },
  CRON:               { type: 'CRON',                label: 'Cron Job',             color: '#d29922', style: 'dotted' },
  QUEUE_USAGE:        { type: 'QUEUE_USAGE',         label: 'Queue',                color: '#e3b341', style: 'dashed' },
  JOB_DISPATCH:       { type: 'JOB_DISPATCH',        label: 'Job Dispatch',         color: '#d29922', style: 'dashed' },

  // Assets & Config
  EXTERNAL_PACKAGE:   { type: 'EXTERNAL_PACKAGE',    label: 'External Package',     color: '#f0883e', style: 'dotted' },
  UTILITY_USAGE:      { type: 'UTILITY_USAGE',       label: 'Utility Usage',        color: '#8b949e', style: 'solid' },
  CSS_MODULE:         { type: 'CSS_MODULE',           label: 'CSS Module',           color: '#f778ba', style: 'dotted' },
  TAILWIND:           { type: 'TAILWIND',             label: 'Tailwind',             color: '#38bdf8', style: 'dotted' },
  SCSS:               { type: 'SCSS',                 label: 'SCSS',                 color: '#cd6799', style: 'dotted' },
  ASSET_USAGE:        { type: 'ASSET_USAGE',          label: 'Asset',                color: '#f778ba', style: 'dotted' },
  CONFIG_USAGE:       { type: 'CONFIG_USAGE',         label: 'Configuration',        color: '#8b949e', style: 'dotted' },
  ENV_USAGE:          { type: 'ENV_USAGE',            label: 'Environment Variable', color: '#7ee787', style: 'dotted' },

  // Testing & DevOps
  TESTS:              { type: 'TESTS',                label: 'Tests',                color: '#7ee787', style: 'dashed' },
  DOCKER:             { type: 'DOCKER',               label: 'Docker',               color: '#2496ed', style: 'dotted' },
  CI_CD:              { type: 'CI_CD',                label: 'CI/CD',                color: '#8b949e', style: 'dotted' },
  EXTERNAL_SERVICE:   { type: 'EXTERNAL_SERVICE',     label: 'External Service',     color: '#f0883e', style: 'dashed' },

  // Listeners
  LISTENER_USAGE:     { type: 'LISTENER_USAGE',       label: 'Listener',             color: '#6cb6ff', style: 'solid' },
  WORKER_USAGE:       { type: 'WORKER_USAGE',         label: 'Worker',               color: '#d29922', style: 'dashed' },

  // Circular
  CIRCULAR:           { type: 'CIRCULAR',             label: 'Circular Dependency',  color: '#f85149', style: 'dashed' },
};

// ─── Universal Graph Builder ─────────────────────────────────────────────────

/**
 * Builder for constructing a Universal Graph Model.
 * Parsers use this to add nodes and edges, then call build() to get the final model.
 */
class UniversalGraphBuilder {
  constructor(projectName = 'Project') {
    this._projectName = projectName;
    this._nodes = new Map();
    this._edges = [];
    this._edgeIdCounter = 0;
    this._metadata = {
      generatedAt: new Date().toISOString(),
      languages: {},
      frameworks: [],
      totalFiles: 0,
      totalLines: 0,
    };
  }

  /**
   * Add a node to the graph.
   * @param {Object} nodeData
   * @param {string} nodeData.id           — Unique identifier (usually relative file path)
   * @param {string} nodeData.name         — Display name
   * @param {string} nodeData.type         — One of NODE_TYPES keys
   * @param {string} [nodeData.filePath]   — Relative file path
   * @param {string} [nodeData.language]   — Programming language
   * @param {string} [nodeData.framework]  — Framework name
   * @param {string} [nodeData.description]
   * @param {string[]} [nodeData.badges]
   * @param {string} [nodeData.status]     — 'active' | 'deprecated' | 'unused'
   * @param {Object} [nodeData.metadata]   — { size, lines, complexity, exports, functions, ... }
   * @returns {UniversalGraphBuilder}
   */
  addNode(nodeData) {
    const typeInfo = NODE_TYPES[nodeData.type] || NODE_TYPES.CUSTOM;
    const node = {
      id: nodeData.id,
      name: nodeData.name || nodeData.id,
      type: typeInfo.type,
      icon: typeInfo.icon,
      label: typeInfo.label,
      color: typeInfo.color,
      filePath: nodeData.filePath || nodeData.id,
      language: nodeData.language || '',
      framework: nodeData.framework || '',
      description: nodeData.description || '',
      badges: nodeData.badges || [],
      status: nodeData.status || 'active',
      metadata: nodeData.metadata || {},
      incomingCount: 0,
      outgoingCount: 0,
      collapsed: false,
    };

    this._nodes.set(node.id, node);
    return this;
  }

  /**
   * Add an edge (relationship) to the graph.
   * @param {Object} edgeData
   * @param {string} edgeData.source — Source node ID
   * @param {string} edgeData.target — Target node ID
   * @param {string} edgeData.type   — One of EDGE_TYPES keys
   * @param {string} [edgeData.label]
   * @param {number} [edgeData.weight]
   * @param {Object} [edgeData.metadata]
   * @returns {UniversalGraphBuilder}
   */
  addEdge(edgeData) {
    const typeInfo = EDGE_TYPES[edgeData.type] || EDGE_TYPES.IMPORTS;
    const edge = {
      id: `e${this._edgeIdCounter++}`,
      source: edgeData.source,
      target: edgeData.target,
      type: typeInfo.type,
      label: edgeData.label || typeInfo.label,
      color: typeInfo.color,
      style: typeInfo.style,
      weight: edgeData.weight || 1,
      metadata: edgeData.metadata || {},
    };

    this._edges.push(edge);
    return this;
  }

  /**
   * Set graph-level metadata.
   * @param {Object} metadata
   * @returns {UniversalGraphBuilder}
   */
  setMetadata(metadata) {
    Object.assign(this._metadata, metadata);
    return this;
  }

  /**
   * Build the final Universal Graph Model.
   * Computes incoming/outgoing counts and deduplicates edges.
   * @returns {Object} The complete graph model
   */
  build() {
    // Compute incoming/outgoing counts
    for (const edge of this._edges) {
      const sourceNode = this._nodes.get(edge.source);
      const targetNode = this._nodes.get(edge.target);
      if (sourceNode) sourceNode.outgoingCount++;
      if (targetNode) targetNode.incomingCount++;
    }

    // Collect unique relationship types used
    const usedRelTypes = {};
    for (const edge of this._edges) {
      const info = EDGE_TYPES[edge.type];
      if (info) usedRelTypes[edge.type] = info;
    }

    // Collect unique node types used
    const usedNodeTypes = {};
    for (const node of this._nodes.values()) {
      const info = NODE_TYPES[node.type];
      if (info) usedNodeTypes[node.type] = info;
    }

    return {
      projectName: this._projectName,
      nodes: Array.from(this._nodes.values()),
      edges: this._edges,
      relationshipTypes: usedRelTypes,
      nodeTypes: usedNodeTypes,
      metadata: this._metadata,
      layout: { type: 'auto', positions: {} },
      viewport: { x: 0, y: 0, zoom: 1 },
      theme: 'dark',
      filters: { nodeTypes: [], edgeTypes: [], languages: [], frameworks: [] },
      collapseState: {},
      selectionState: { selectedNodes: [], selectedEdges: [] },
    };
  }

  /**
   * Build and serialize to JSON string.
   * @param {number} [indent=2]
   * @returns {string}
   */
  toJSON(indent = 2) {
    return JSON.stringify(this.build(), null, indent);
  }

  /**
   * Reconstruct a graph model from a JSON string or parsed object.
   * @param {string|Object} input
   * @returns {Object} graph model
   */
  static fromJSON(input) {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    // Validate minimum shape
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error('Invalid graph model: must contain nodes[] and edges[]');
    }
    return data;
  }
}

module.exports = {
  NODE_TYPES,
  EDGE_TYPES,
  UniversalGraphBuilder,
};
