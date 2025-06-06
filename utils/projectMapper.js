/**
 * Project Structure Mapper
 * 
 * Analyzes project files to build a connectivity map showing relationships
 * between files, components, imports, and dependencies.
 */

const fs = require('fs-extra');
const path = require('path');

// File types we want to analyze
const ANALYZABLE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];

/**
 * Project structure mapper class
 */
class ProjectMapper {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.connectionMap = {
      nodes: [], // Files and components
      edges: [], // Connections between them
      groups: [], // Directories and modules
    };
    this.fileIndex = new Map(); // Maps file paths to node IDs
    this.componentIndex = new Map(); // Maps component names to node IDs
  }

  /**
   * Analyze the entire project structure
   */
  async analyzeProject(targetDir = '') {
    const dir = path.join(this.projectRoot, targetDir);
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.projectRoot, entryPath);
        
        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
            continue;
          }
          
          // Add directory as a group
          const groupId = this.connectionMap.groups.length;
          this.connectionMap.groups.push({
            id: groupId,
            name: entry.name,
            path: relativePath,
            parentPath: targetDir
          });
          
          // Recursively analyze subdirectory
          await this.analyzeProject(relativePath);
        } else {
          // Check if file is analyzable
          const ext = path.extname(entry.name).toLowerCase();
          if (ANALYZABLE_EXTENSIONS.includes(ext)) {
            await this.analyzeFile(relativePath);
          }
        }
      }
      
      // After analyzing all files, resolve connections between them
      await this.resolveConnections();
      
      return this.connectionMap;
    } catch (error) {
      console.error(`Error analyzing project structure: ${error.message}`);
      return this.connectionMap;
    }
  }

  /**
   * Analyze a single file for imports, exports, and component relationships
   */
  async analyzeFile(filePath) {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Add file node if it doesn't exist
      let fileNodeId = this.fileIndex.get(filePath);
      if (fileNodeId === undefined) {
        fileNodeId = this.connectionMap.nodes.length;
        this.fileIndex.set(filePath, fileNodeId);
        
        this.connectionMap.nodes.push({
          id: fileNodeId,
          type: 'file',
          name: path.basename(filePath),
          path: filePath,
          components: [],
          imports: []
        });
      }
      
      // Parse the file content
      const fileNode = this.connectionMap.nodes[fileNodeId];
      
      // Extract imports and components using regex patterns
      // This is a simplified approach without full AST parsing
      
      // Extract component definition (simplified)
      const componentName = path.basename(filePath, path.extname(filePath));
      this.registerComponent(componentName, fileNode);
      
      // Extract imports using regex
      const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
      let importMatch;
      
      while ((importMatch = importRegex.exec(content)) !== null) {
        const namedImports = importMatch[1] ? importMatch[1].split(',').map(s => s.trim()) : [];
        const defaultImport = importMatch[2];
        const importPath = importMatch[3];
        
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
          fileNode.imports.push({
            path: importPath,
            specifiers: [
              ...(defaultImport ? [{ type: 'default', name: defaultImport }] : []),
              ...namedImports.map(name => ({ type: 'named', name }))
            ]
          });
        }
      }
      
      // Extract require statements
      const requireRegex = /(?:const|let|var)\s+(?:{([^}]+)}|(\w+))\s*=\s*require\s*\(['"]([^'"]+)['"]\)/g;
      let requireMatch;
      
      while ((requireMatch = requireRegex.exec(content)) !== null) {
        const namedImports = requireMatch[1] ? requireMatch[1].split(',').map(s => s.trim()) : [];
        const defaultImport = requireMatch[2];
        const importPath = requireMatch[3];
        
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
          fileNode.imports.push({
            path: importPath,
            specifiers: [
              ...(defaultImport ? [{ type: 'default', name: defaultImport }] : []),
              ...namedImports.map(name => ({ type: 'named', name }))
            ]
          });
        }
      }
      
      return fileNode;
    } catch (error) {
      console.error(`Error analyzing file ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Register a component and link it to its file
   */
  registerComponent(componentName, fileNode) {
    // Add component to the file's components list if not already there
    if (!fileNode.components.includes(componentName)) {
      fileNode.components.push(componentName);
      
      // Add component node if it doesn't exist
      let componentNodeId = this.componentIndex.get(componentName);
      if (componentNodeId === undefined) {
        componentNodeId = this.connectionMap.nodes.length;
        this.componentIndex.set(componentName, componentNodeId);
        
        this.connectionMap.nodes.push({
          id: componentNodeId,
          type: 'component',
          name: componentName,
          definedIn: fileNode.path
        });
      }
      
      // Add edge from file to component
      this.connectionMap.edges.push({
        source: fileNode.id,
        target: componentNodeId,
        type: 'defines'
      });
    }
  }

  /**
   * Resolve import paths and create connections
   */
  async resolveConnections() {
    // Process all file nodes
    for (const node of this.connectionMap.nodes) {
      if (node.type === 'file' && node.imports && node.imports.length > 0) {
        for (const importItem of node.imports) {
          // Resolve the import path to a file path
          const importPath = importItem.path;
          const sourceDir = path.dirname(path.join(this.projectRoot, node.path));
          
          let resolvedPath;
          if (importPath.startsWith('.')) {
            // Relative import
            resolvedPath = path.normalize(path.join(sourceDir, importPath));
          } else if (importPath.startsWith('/')) {
            // Absolute import (from project root)
            resolvedPath = path.normalize(path.join(this.projectRoot, importPath));
          } else {
            // Skip external imports
            continue;
          }
          
          // Try to find the exact file
          let targetFilePath = resolvedPath;
          if (!await fs.pathExists(targetFilePath)) {
            // Try adding extensions
            for (const ext of ANALYZABLE_EXTENSIONS) {
              if (await fs.pathExists(targetFilePath + ext)) {
                targetFilePath += ext;
                break;
              }
            }
            
            // Try index files
            if (!await fs.pathExists(targetFilePath)) {
              for (const ext of ANALYZABLE_EXTENSIONS) {
                const indexPath = path.join(targetFilePath, `index${ext}`);
                if (await fs.pathExists(indexPath)) {
                  targetFilePath = indexPath;
                  break;
                }
              }
            }
          }
          
          // If we found a file, create a connection
          if (await fs.pathExists(targetFilePath)) {
            const relativePath = path.relative(this.projectRoot, targetFilePath);
            const targetNodeId = this.fileIndex.get(relativePath);
            
            if (targetNodeId !== undefined) {
              // Add edge from source file to target file
              this.connectionMap.edges.push({
                source: node.id,
                target: targetNodeId,
                type: 'imports'
              });
              
              // Connect to specific components if they're imported
              const targetNode = this.connectionMap.nodes[targetNodeId];
              if (targetNode && targetNode.components && targetNode.components.length > 0) {
                for (const componentName of targetNode.components) {
                  const componentNodeId = this.componentIndex.get(componentName);
                  
                  if (componentNodeId !== undefined) {
                    // Add edge from source file to component
                    this.connectionMap.edges.push({
                      source: node.id,
                      target: componentNodeId,
                      type: 'uses'
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return this.connectionMap;
  }

  /**
   * Generate a Mermaid diagram from the connection map
   */
  generateMermaidDiagram() {
    let diagram = 'graph TD;\n';
    
    // Add nodes
    for (const node of this.connectionMap.nodes) {
      if (node.type === 'file') {
        diagram += `  F${node.id}["📄 ${node.name}"];\n`;
      } else if (node.type === 'component') {
        diagram += `  C${node.id}["🧩 ${node.name}"];\n`;
      }
    }
    
    // Add edges
    for (const edge of this.connectionMap.edges) {
      const sourcePrefix = this.connectionMap.nodes[edge.source].type === 'file' ? 'F' : 'C';
      const targetPrefix = this.connectionMap.nodes[edge.target].type === 'file' ? 'F' : 'C';
      
      if (edge.type === 'defines') {
        diagram += `  ${sourcePrefix}${edge.source} -->|defines| ${targetPrefix}${edge.target};\n`;
      } else if (edge.type === 'imports') {
        diagram += `  ${sourcePrefix}${edge.source} -->|imports| ${targetPrefix}${edge.target};\n`;
      } else if (edge.type === 'uses') {
        diagram += `  ${sourcePrefix}${edge.source} -->|uses| ${targetPrefix}${edge.target};\n`;
      }
    }
    
    // Add subgraphs for directories
    const dirGroups = new Map();
    for (const node of this.connectionMap.nodes) {
      if (node.type === 'file') {
        const dirPath = path.dirname(node.path);
        if (dirPath !== '.') {
          if (!dirGroups.has(dirPath)) {
            dirGroups.set(dirPath, []);
          }
          dirGroups.get(dirPath).push(node.id);
        }
      }
    }
    
    for (const [dirPath, nodeIds] of dirGroups.entries()) {
      diagram += `  subgraph "${dirPath}"\n`;
      for (const id of nodeIds) {
        diagram += `    F${id}\n`;
      }
      diagram += '  end\n';
    }
    
    return diagram;
  }
}

module.exports = ProjectMapper; 