/**
 * TypeScript Type Definitions for project-tree-md
 */

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  size?: number;
  extension?: string;
  permissions?: string;
  owner?: string;
  modified?: string;
  created?: string;
  hash?: string;
  summary?: string;
  gitStatus?: 'M' | 'A' | 'D' | '?' | 'U' | 'C' | string;
}

export interface TreeStats {
  files: number;
  directories: number;
  totalSize: number;
  humanSize: string;
  extensionCounts: Record<string, number>;
  maxDepth: number;
}

export interface ScanOptions {
  maxDepth?: number;
  exclude?: RegExp | string;
  includeHidden?: boolean;
  respectGitignore?: boolean;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
  hashAlgorithm?: string;
  includePermissions?: boolean;
  includeOwner?: boolean;
  includeModified?: boolean;
  includeCreated?: boolean;
  includeHashes?: boolean;
  gitStatus?: boolean;
  changedOnly?: boolean;
}

export interface GenerateOptions extends ScanOptions {
  theme?: string | object;
  icons?: string | object;
  noColor?: boolean;
}

export interface ProjectInfo {
  name: string;
  frameworks: string[];
  languages: Record<string, number>;
  entryPoint?: string;
  packageManager?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  file?: string;
  language?: string;
  size?: number;
  lines?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface UniversalGraphModel {
  projectName: string;
  generatedAt: string;
  version: string;
  generator: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: Record<string, any>;
}

export function scan(dirPath: string, options?: ScanOptions): TreeNode;
export function generateTree(dirPath: string, options?: GenerateOptions): string;
export function buildTreeText(node: TreeNode, options?: any): string;
export function buildColoredTreeText(node: TreeNode, options?: any): string;
export function computeStats(rootNode: TreeNode): TreeStats;
export function detectProject(dirPath: string): ProjectInfo;
export function buildIgnoreMatcher(dirPath: string, customExclude?: string | RegExp): (filePath: string) => boolean;

// Exporters
export function toJson(rootNode: TreeNode, options?: any): string;
export function toHtml(rootNode: TreeNode, options?: any): string;
export function toMindmapHtml(rootNode: TreeNode, options?: any): string;
export function toSvg(rootNode: TreeNode, options?: any): string;
export function toMermaid(rootNode: TreeNode, options?: any): string;
export function toArchitectureFlowHtml(flowData: any, options?: any): string;
export function toCsv(rootNode: TreeNode, options?: any): string;
export function toTsv(rootNode: TreeNode, options?: any): string;
export function toXml(rootNode: TreeNode, options?: any): string;
export function toYaml(rootNode: TreeNode, options?: any): string;
export function toPlantUml(rootNode: TreeNode, options?: any): string;

// Universal Graph
export function generateUniversalGraph(dirPath: string, options?: any): UniversalGraphModel;
export function toGraphVisualizerHtml(graphModel: UniversalGraphModel, options?: any): string;
export function toGraph3dVisualizerHtml(graphModel: UniversalGraphModel, options?: any): string;
export function toGraphJson(graphModel: UniversalGraphModel): string;
export function fromGraphJson(jsonString: string): UniversalGraphModel;

// Features & AI Discovery
export function generateAiContext(dirPath: string, options?: any): string;
export function generateAiPrompt(dirPath: string, options?: any): string;
export function generateAIContext(dirPath: string, options?: any): string;
export function generateAIPrompt(dirPath: string, options?: any): string;
export function generateAiRules(dirPath: string, options?: any): string;
export function estimateTokens(text: string): { tokens: number; lines: number; characters: number };
export function compare(dirPathA: string, dirPathB: string, options?: any): any;
export function detectMonorepo(dirPath: string): any;

// Bundles & Exports
export function generateBundle(dirPath: string, options?: any): string;
export function exportReports(dirPath: string, options?: any): any;

// Git Features
export function getGitStatus(dirPath: string): Record<string, string>;

// Server
export function startLiveServer(dirPath: string, options?: { port?: number; openHtml?: boolean }): Promise<{ server: any; url: string }>;

// Utilities
export function openInBrowser(filePath: string): boolean;
