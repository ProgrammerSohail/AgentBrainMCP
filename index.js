#!/usr/bin/env node

/**
 * Context-Aware MCP Agent - Main Entry Point
 * Starts both the FileSystemServer and CommanderMCP
 */

const path = require('path');
const fs = require('fs-extra');
const dotenv = require('dotenv');
const { spawn } = require('child_process');
const readline = require('readline');
const express = require('express');

// Load environment variables
dotenv.config();

const configPath = path.join(__dirname, 'config.json');
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

const SERVER_PORT = config.filesystemPort || process.env.SERVER_PORT || 9000;
const COMMANDER_PORT = config.commanderPort || process.env.COMMANDER_PORT || 4000;
const DEFAULT_SHELL = config.defaultShell || 'powershell';
const ALLOWED_DIRECTORIES = config.allowedDirectories || [path.resolve(__dirname)];
const BLOCKED_COMMANDS = config.blockedCommands || [];
const FILE_READ_LINE_LIMIT = config.fileReadLineLimit || 1000;
const FILE_WRITE_LINE_LIMIT = config.fileWriteLineLimit || 50;
const TELEMETRY_ENABLED = config.telemetryEnabled !== undefined ? config.telemetryEnabled : true;

// Banner
console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║         CONTEXT-AWARE MCP STARTING            ║
║                                               ║
║   Persistent Memory for AI Coding Assistants  ║
║                                               ║
║               ProgrammerSohail                ║
║                                               ║
╚═══════════════════════════════════════════════╝
`);

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file with default settings...');
  fs.writeFileSync(
    envPath,
    `SERVER_PORT=${SERVER_PORT}\nCOMMANDER_PORT=${COMMANDER_PORT}\nDEFAULT_SHELL=${DEFAULT_SHELL}\nALLOWED_DIRECTORIES=${ALLOWED_DIRECTORIES.join(',')}\nBLOCKED_COMMANDS=${BLOCKED_COMMANDS.join(',')}\nFILE_READ_LINE_LIMIT=${FILE_READ_LINE_LIMIT}\nFILE_WRITE_LINE_LIMIT=${FILE_WRITE_LINE_LIMIT}\nTELEMETRY_ENABLED=${TELEMETRY_ENABLED}\n`
  );
  console.log('✅ .env file created');
}

// Check if memory directory exists and create if needed
const memoryPath = path.join(__dirname, 'memory');
if (!fs.existsSync(memoryPath)) {
  console.log('📁 Creating memory directory...');
  fs.mkdirSync(memoryPath);
  console.log('✅ Memory directory created');
}

// Ensure all memory files exist
const memoryFiles = {
  'project.json': {
    name: 'Context-Aware MCP',
    purpose: 'A context-aware memory system for AI coding assistants',
    languages: [],
    dependencies: {},
    key_frameworks: []
  },
  'architecture.md': '# Architecture\n\nDocument your system architecture here.',
  'decisions.md': '# Design Decisions\n\nRecord important design decisions here.',
  'changelog.md': '# Changelog\n\n## [Unreleased]\n- Initial project setup with Context-Aware MCP Agent',
  'todos.md': '# To-Do List\n\n- [ ] Define project requirements\n- [ ] Set up development environment',
  'development-guidelines.md': '# Development Guidelines\n\nDocument your coding standards and guidelines here.'
};

Object.entries(memoryFiles).forEach(([fileName, defaultContent]) => {
  const filePath = path.join(memoryPath, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`📄 Creating ${fileName}...`);
    const content = typeof defaultContent === 'object' 
      ? JSON.stringify(defaultContent, null, 2) 
      : defaultContent;
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${fileName} created`);
  }
});

// Start servers
let fileSystemServer;
let commanderServer;

function startFileSystemServer() {
  console.log('🚀 Starting FileSystemServer...');
  fileSystemServer = spawn('node', [path.join(__dirname, 'FileSystemServer', 'server.js')], {
    stdio: 'pipe'
  });

  fileSystemServer.stdout.on('data', (data) => {
    console.log(`[FileSystemServer] ${data.toString().trim()}`);
  });

  fileSystemServer.stderr.on('data', (data) => {
    console.error(`[FileSystemServer ERROR] ${data.toString().trim()}`);
  });

  fileSystemServer.on('close', (code) => {
    if (code !== 0) {
      console.log(`FileSystemServer exited with code ${code}`);
    }
  });
}

function startCommanderServer() {
  console.log('🚀 Starting CommanderMCP...');
  commanderServer = spawn('node', [path.join(__dirname, 'CommanderMCP', 'server.js')], {
    stdio: 'pipe'
  });

  commanderServer.stdout.on('data', (data) => {
    console.log(`[CommanderMCP] ${data.toString().trim()}`);
  });

  commanderServer.stderr.on('data', (data) => {
    console.error(`[CommanderMCP ERROR] ${data.toString().trim()}`);
  });

  commanderServer.on('close', (code) => {
    if (code !== 0) {
      console.log(`CommanderMCP exited with code ${code}`);
    }
  });
}

// Map project structure
function mapProjectStructure() {
  console.log('🗺️ Mapping project structure...');
  const mapScript = spawn('node', [path.join(__dirname, 'scripts', 'map-project.js')], {
    stdio: 'inherit'
  });
  
  mapScript.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Project structure mapping complete');
    } else {
      console.error(`❌ Project structure mapping failed with code ${code}`);
    }
  });
}

// Start both servers
startFileSystemServer();
startCommanderServer();

// Set up user interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Display help menu
function showHelp() {
  console.log(`
Available commands:
  help      - Show this help menu
  status    - Check server status
  restart   - Restart both servers
  prompt    - Show the starter prompt for AI assistants
  map       - Generate project structure map
  quit      - Stop servers and exit

Context-Aware AgentBrainMCP is running at:
  - Server: http://localhost:${SERVER_PORT}
`);
}

// Show status
function showStatus() {
  console.log(`
AgentBrainMCP Status:
  - Server: ${fileSystemServer?.killed && commanderServer?.killed ? 'Stopped' : 'Running'} (http://localhost:${SERVER_PORT})
`);
}

// Show starter prompt
function showStarterPrompt() {
  try {
    const promptPath = path.join(__dirname, 'prompts', 'starterPrompt.txt');
    const promptContent = fs.readFileSync(promptPath, 'utf8');
    console.log('\n=== STARTER PROMPT FOR AI ASSISTANTS ===\n');
    console.log(promptContent);
    console.log('\n=== END OF PROMPT ===\n');
    console.log('Copy this prompt to use with your AI assistant');
  } catch (error) {
    console.error('Error reading starter prompt:', error.message);
  }
}

// Restart servers
function restartServers() {
  console.log('🔄 Restarting servers...');
  
  if (fileSystemServer && !fileSystemServer.killed) {
    fileSystemServer.kill();
  }
  
  if (commanderServer && !commanderServer.killed) {
    commanderServer.kill();
  }
  
  setTimeout(() => {
    startFileSystemServer();
    startCommanderServer();
  }, 1000);
}

// Handle user commands
console.log('\n🤖 AgentBrainMCP is now running! Type "help" for available commands');

rl.on('line', (input) => {
  const command = input.trim().toLowerCase();
  
  switch (command) {
    case 'help':
      showHelp();
      break;
    case 'status':
      showStatus();
      break;
    case 'restart':
      restartServers();
      break;
    case 'prompt':
      showStarterPrompt();
      break;
    case 'map':
      mapProjectStructure();
      break;
    case 'quit':
    case 'exit':
      console.log('👋 Shutting down AgentBrainMCP...');
      if (fileSystemServer) fileSystemServer.kill();
      if (commanderServer) commanderServer.kill();
      setTimeout(() => {
        console.log('✅ AgentBrainMCP has been stopped');
        process.exit(0);
      }, 500);
      break;
    default:
      console.log(`Unknown command: "${input}". Type "help" for available commands.`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down AgentBrainMCP...');
  if (fileSystemServer) fileSystemServer.kill();
  if (commanderServer) commanderServer.kill();
  setTimeout(() => {
    console.log('✅ AgentBrainMCP has been stopped');
    process.exit(0);
  }, 500);
});

// Export for programmatic usage
module.exports = {
  startFileSystemServer,
  startCommanderServer,
  restartServers,
  mapProjectStructure,
  port: SERVER_PORT
};

// REST API for runtime config management
const app = express();
app.use(express.json());

// GET current config
app.get('/api/config', (req, res) => {
  res.json(config);
});

const auditLogPath = path.join(__dirname, 'logs', 'audit.log');
function logAudit(action, details, result) {
  const timestamp = new Date().toISOString();
  const entry = `${timestamp} | ${action} | ${JSON.stringify(details)} | ${result}\n`;
  fs.ensureDirSync(path.dirname(auditLogPath));
  fs.appendFileSync(auditLogPath, entry);
}

// POST update config value
app.post('/api/config', (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    logAudit('CONFIG_UPDATE', { key, value }, 'error: missing key');
    return res.status(400).json({ error: 'Missing key' });
  }
  config[key] = value;
  // Persist to config.json
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    logAudit('CONFIG_UPDATE', { key, value }, 'success');
    res.json({ success: true, config });
  } catch (err) {
    logAudit('CONFIG_UPDATE', { key, value }, 'error: write failed');
    res.status(500).json({ error: 'Failed to write config file' });
  }
});

// Start the config API server (on a separate port or the same as main server)
const CONFIG_API_PORT = config.configApiPort || 5050;
app.listen(CONFIG_API_PORT, () => {
  console.log(`Config API server running on port ${CONFIG_API_PORT}`);
}); 