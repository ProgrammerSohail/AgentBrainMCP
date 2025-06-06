/**
 * Post-install setup check script
 * Ensures all necessary files and directories exist
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Root directory of the project
const rootDir = path.join(__dirname, '..');

console.log('🔍 Checking MCP Agent setup...');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✓ Node.js version: ${nodeVersion}`);

// Ensure all directories exist
const requiredDirs = [
  'memory',
  'FileSystemServer',
  'CommanderMCP',
  'utils',
  'prompts'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Creating missing directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Ensure .env file exists
const envPath = path.join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file with default settings...');
  fs.writeFileSync(
    envPath,
    'FILESYSTEM_PORT=4000\nCOMMANDER_PORT=5000\n'
  );
}

// Check for required files
const requiredFiles = [
  { path: 'FileSystemServer/server.js', message: 'FileSystemServer is missing!' },
  { path: 'CommanderMCP/server.js', message: 'CommanderMCP is missing!' },
  { path: 'utils/memoryManager.js', message: 'Memory manager utility is missing!' },
  { path: 'prompts/starterPrompt.txt', message: 'Starter prompt is missing!' }
];

let missingFiles = false;
requiredFiles.forEach(file => {
  const filePath = path.join(rootDir, file.path);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: ${file.message}`);
    missingFiles = true;
  }
});

if (missingFiles) {
  console.error('\n❌ Some required files are missing. The MCP Agent may not work correctly.');
  console.error('Please reinstall or check the GitHub repository for the missing files.');
} else {
  console.log('\n✅ MCP Agent setup looks good!');
  console.log('To start the MCP Agent, run: npm start');
}

// Check if memory files exist, create if needed
const memoryPath = path.join(rootDir, 'memory');
const memoryFiles = {
  'project.json': {
    name: 'My Project',
    purpose: 'A project with MCP Agent memory',
    languages: [],
    dependencies: {},
    key_frameworks: []
  },
  'architecture.md': '# Architecture\n\nDocument your system architecture here.',
  'decisions.md': '# Design Decisions\n\nRecord important design decisions here.',
  'changelog.md': '# Changelog\n\n## [Unreleased]\n- Initial project setup with MCP Agent',
  'todos.md': '# To-Do List\n\n- [ ] Define project requirements\n- [ ] Set up development environment'
};

Object.entries(memoryFiles).forEach(([fileName, defaultContent]) => {
  const filePath = path.join(memoryPath, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`📄 Creating ${fileName}...`);
    const content = typeof defaultContent === 'object' 
      ? JSON.stringify(defaultContent, null, 2) 
      : defaultContent;
    fs.writeFileSync(filePath, content);
  }
});

console.log('\n🚀 Ready to use MCP Agent!');
console.log('Run "npm start" to launch the MCP Agent'); 