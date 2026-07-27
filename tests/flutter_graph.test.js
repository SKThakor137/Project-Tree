'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { generateUniversalGraph } = require('../src/core/universalParser.js');
const { generateArchitectureFlow } = require('../src/core/architectureFlow.js');
const { toGraphVisualizerHtml } = require('../src/exporters/graphVisualizer.js');
const { toArchitectureFlowHtml } = require('../src/exporters/architectureFlowHtml.js');

console.log('🧪 Running Flutter & Graph Visualization Tests...\n');

// Create temporary directory for mock Flutter project
const tmpDir = path.join(__dirname, 'tmp_flutter_test');
if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
fs.mkdirSync(path.join(tmpDir, 'lib', 'screens'), { recursive: true });
fs.mkdirSync(path.join(tmpDir, 'lib', 'widgets'), { recursive: true });
fs.mkdirSync(path.join(tmpDir, 'lib', 'services'), { recursive: true });

// Mock pubspec.yaml
fs.writeFileSync(path.join(tmpDir, 'pubspec.yaml'), `
name: my_flutter_app
description: A new Flutter project.
dependencies:
  flutter:
    sdk: flutter
  http: ^0.13.0
`, 'utf8');

// Mock lib/main.dart
fs.writeFileSync(path.join(tmpDir, 'lib', 'main.dart'), `
import 'package:flutter/material.dart';
import 'package:my_flutter_app/screens/home_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return HomeScreen();
  }
}
`, 'utf8');

// Mock lib/screens/home_screen.dart
fs.writeFileSync(path.join(tmpDir, 'lib', 'screens', 'home_screen.dart'), `
import 'package:flutter/material.dart';
import 'package:my_flutter_app/widgets/custom_button.dart';
import 'package:my_flutter_app/services/api_service.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();

  void fetchData() {
    _apiService.getData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomButton(onPressed: fetchData),
    );
  }
}
`, 'utf8');

// Mock lib/widgets/custom_button.dart
fs.writeFileSync(path.join(tmpDir, 'lib', 'widgets', 'custom_button.dart'), `
import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final VoidCallback onPressed;
  CustomButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(onPressed: onPressed, child: Text('Click'));
  }
}
`, 'utf8');

// Mock lib/services/api_service.dart
fs.writeFileSync(path.join(tmpDir, 'lib', 'services', 'api_service.dart'), `
import 'package:http/http.dart' as http;

class ApiService {
  Future<void> getData() async {
    await http.get(Uri.parse('https://example.com'));
  }
}
`, 'utf8');

try {
  // Test 1: Universal Graph for Flutter Project
  console.log('  Testing Universal Graph generation for Flutter project...');
  const graph = generateUniversalGraph(tmpDir);
  assert.ok(graph, 'Graph model should be generated');
  assert.ok(graph.projectName, 'Project name should exist');

  const mainNode = graph.nodes.find(n => n.id.includes('main.dart'));
  const homeNode = graph.nodes.find(n => n.id.includes('home_screen.dart'));
  const btnNode = graph.nodes.find(n => n.id.includes('custom_button.dart'));
  const apiNode = graph.nodes.find(n => n.id.includes('api_service.dart'));

  assert.ok(mainNode, 'main.dart node should exist');
  assert.ok(homeNode, 'home_screen.dart node should exist');
  assert.ok(btnNode, 'custom_button.dart node should exist');
  assert.ok(apiNode, 'api_service.dart node should exist');

  // Check internal package imports resolution
  const mainToHomeEdge = graph.edges.find(e => e.source === mainNode.id && e.target === homeNode.id);
  assert.ok(mainToHomeEdge, 'main.dart -> home_screen.dart import edge should exist');

  const homeToBtnEdge = graph.edges.find(e => e.source === homeNode.id && e.target === btnNode.id);
  assert.ok(homeToBtnEdge, 'home_screen.dart -> custom_button.dart import edge should exist');

  const homeToApiEdge = graph.edges.find(e => e.source === homeNode.id && e.target === apiNode.id);
  assert.ok(homeToApiEdge, 'home_screen.dart -> api_service.dart import edge should exist');

  // Check external package edge
  const flutterMaterialEdge = graph.edges.find(e => e.source === mainNode.id && e.target === 'dart:flutter');
  assert.ok(flutterMaterialEdge, 'External package dart:flutter edge should exist');

  console.log('  ✅ Flutter internal and external imports correctly resolved!');

  // Test 2: Architecture Flow for Flutter Project
  console.log('  Testing Architecture Flow for Flutter project...');
  const flow = generateArchitectureFlow(tmpDir);
  assert.ok(flow, 'Architecture flow result should exist');
  assert.ok(flow.treeNode, 'Flow tree root node should exist');

  const flowHtml = toArchitectureFlowHtml(flow, 'my_flutter_app');
  assert.ok(flowHtml.includes('my_flutter_app'), 'Flow HTML should include project name');
  assert.ok(flowHtml.length > 5000, 'Flow HTML content should be substantial');

  console.log('  ✅ Architecture Flow generated successfully for Flutter project!');

  // Test 3: Graph Visualizer HTML Generation & Large Graph Check
  console.log('  Testing Graph Visualizer HTML output...');
  const graphHtml = toGraphVisualizerHtml(graph, 'my_flutter_app');
  assert.ok(graphHtml.includes('Code Relationship Graph'), 'Graph HTML title should exist');
  assert.ok(graphHtml.includes('dagre'), 'Graph HTML should include fast layout engine');

  // Large graph simulation test (create 250 mock nodes)
  const largeNodes = [];
  const largeEdges = [];
  for (let i = 0; i < 250; i++) {
    largeNodes.push({ id: `file_${i}.dart`, name: `file_${i}.dart`, type: 'COMPONENT' });
    if (i > 0) {
      largeEdges.push({ source: `file_${Math.floor(i / 2)}.dart`, target: `file_${i}.dart`, type: 'IMPORTS' });
    }
  }
  const largeGraph = { projectName: 'large_flutter_app', nodes: largeNodes, edges: largeEdges };
  const largeHtml = toGraphVisualizerHtml(largeGraph, 'large_flutter_app');
  assert.ok(largeHtml.length > 10000, 'Large graph HTML should generate without error');
  assert.ok(largeHtml.includes('if (n > 150) return \'dagre\';'), 'Large graph visualizer should auto-select dagre layout');

  console.log('  ✅ Large graph visualizer HTML performance safeguards verified!');

  console.log('\n✨ All Flutter & Graph Visualization tests passed!\n');
} finally {
  // Cleanup
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
