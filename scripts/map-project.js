/**
 * Project Structure Mapper Script
 * 
 * This script analyzes a project's structure and generates a Mermaid diagram
 * showing the relationships between files and components.
 * 
 * Usage: node map-project.js [project_path]
 */

const path = require('path');
const fs = require('fs-extra');
const ProjectMapper = require('../utils/projectMapper');

async function main() {
  try {
    // Get project path from command line args or use parent directory
    const projectPath = process.argv[2] || path.join(__dirname, '../..');
    console.log(`Mapping project structure for: ${projectPath}`);
    
    // Create project mapper
    const mapper = new ProjectMapper(projectPath);
    
    // Analyze project structure
    console.log('Analyzing project structure...');
    const connectionMap = await mapper.analyzeProject();
    
    console.log(`Found ${connectionMap.nodes.length} nodes and ${connectionMap.edges.length} connections`);
    
    // Generate diagram
    console.log('Generating Mermaid diagram...');
    const diagram = mapper.generateMermaidDiagram();
    
    // Save files to memory directory
    const memoryDir = path.join(__dirname, '../memory');
    await fs.ensureDir(memoryDir);
    
    // Save diagram
    const diagramPath = path.join(memoryDir, 'structure.mmd');
    await fs.writeFile(diagramPath, diagram, 'utf8');
    console.log(`Diagram saved to: ${diagramPath}`);
    
    // Save connection map as JSON
    const jsonPath = path.join(memoryDir, 'structure.json');
    await fs.writeFile(jsonPath, JSON.stringify(connectionMap, null, 2), 'utf8');
    console.log(`Connection map saved to: ${jsonPath}`);
    
    // Print sample of the diagram
    console.log('\nSample of the generated diagram:');
    console.log(diagram.split('\n').slice(0, 10).join('\n') + '\n...');
    
    console.log('\nTo view the complete diagram:');
    console.log('1. Copy the content of structure.mmd');
    console.log('2. Paste it into a Mermaid editor like https://mermaid.live');
    
    // Count of different types
    const fileCount = connectionMap.nodes.filter(n => n.type === 'file').length;
    const componentCount = connectionMap.nodes.filter(n => n.type === 'component').length;
    const importCount = connectionMap.edges.filter(e => e.type === 'imports').length;
    
    console.log(`\nSummary: ${fileCount} files, ${componentCount} components, ${importCount} imports`);
    
  } catch (error) {
    console.error('Error mapping project structure:', error);
    process.exit(1);
  }
}

main(); 