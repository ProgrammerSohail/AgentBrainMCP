/**
 * Simple MCP Agent Client Example
 * 
 * This example shows how to connect to both the FileSystemServer and CommanderMCP
 * to interact with the MCP Agent's memory system.
 */

const WebSocket = require('ws');
const axios = require('axios');

// Configuration
const FILE_SERVER_URL = 'http://localhost:4000';
const COMMANDER_URL = 'ws://localhost:5000';

// Connect to CommanderMCP via WebSocket
console.log('Connecting to CommanderMCP...');
const ws = new WebSocket(COMMANDER_URL);

// WebSocket event handlers
ws.on('open', () => {
  console.log('Connected to CommanderMCP!');
  
  // Example: Get project context
  sendCommand('GET_CONTEXT');
  
  // Example: Read a memory file
  sendCommand('READ_MEMORY', { fileName: 'project.json' });
  
  // Example: Log a new decision
  sendCommand('LOG_DECISION', {
    decision: 'Using MCP Agent for project memory',
    rationale: 'To provide persistent context for AI assistants'
  });
  
  // Example: Update a todo item
  sendCommand('UPDATE_TODO', {
    task: 'Set up development environment',
    completed: true
  });
});

ws.on('message', (data) => {
  const response = JSON.parse(data);
  console.log('\nReceived from CommanderMCP:');
  console.log(JSON.stringify(response, null, 2));
  
  // Example of how to use the response
  if (response.type === 'memory_content' && response.data.fileName === 'project.json') {
    console.log('\nProject name:', JSON.parse(response.data.content).name);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

// Helper function to send commands to CommanderMCP
function sendCommand(command, params = {}) {
  const message = JSON.stringify({ command, params });
  console.log(`\nSending command: ${command}`);
  ws.send(message);
}

// Example: Use FileSystemServer REST API
async function readFile(filePath) {
  try {
    console.log(`\nReading file: ${filePath}`);
    const response = await axios.get(`${FILE_SERVER_URL}/api/file`, {
      params: { path: filePath }
    });
    console.log('File content received:');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error reading file:', error.message);
    return null;
  }
}

async function writeFile(filePath, content) {
  try {
    console.log(`\nWriting to file: ${filePath}`);
    const response = await axios.post(`${FILE_SERVER_URL}/api/file`, {
      filePath,
      content
    });
    console.log('File write response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error writing file:', error.message);
    return null;
  }
}

// Example: Get all memory files
async function getMemoryFiles() {
  try {
    console.log('\nGetting memory files...');
    const response = await axios.get(`${FILE_SERVER_URL}/api/memory`);
    console.log('Memory files:');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting memory files:', error.message);
    return null;
  }
}

// Run the REST API examples after a short delay
setTimeout(() => {
  readFile('./memory/todos.md')
    .then(() => getMemoryFiles())
    .then(() => {
      // Example: Write to a new file
      return writeFile('./memory/notes.md', '# Project Notes\n\nThis is a test note created by the simple client example.');
    })
    .catch(error => console.error('Error in API calls:', error));
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing connection...');
  ws.close();
  process.exit(0);
});

console.log('Simple MCP Agent client started. Press Ctrl+C to exit.'); 