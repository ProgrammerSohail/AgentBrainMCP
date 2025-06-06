const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');
const { readMemoryFile, writeMemoryFile, appendToMemoryFile, addTodo, updateTodo, logDecision } = require('../utils/memoryManager');
const ProjectMapper = require('../utils/projectMapper');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.COMMANDER_PORT || 4000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// Store connected clients
const clients = new Set();

// Store project context
const projectContext = {
  lastCommand: null,
  activeSessions: [],
  recentFiles: [],
  projectStructure: null,
  memories: []
};

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);
  
  // Send initial context
  ws.send(JSON.stringify({
    type: 'context',
    data: projectContext
  }));
  
  // Handle messages from clients
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received command:', data.command);
      
      // Update last command in context
      projectContext.lastCommand = {
        command: data.command,
        timestamp: new Date().toISOString()
      };
      
      // Process commands
      switch (data.command) {
        case 'READ_MEMORY':
          handleReadMemory(ws, data.params);
          break;
          
        case 'WRITE_MEMORY':
          handleWriteMemory(ws, data.params);
          break;
          
        case 'GET_CONTEXT':
          handleGetContext(ws);
          break;
          
        case 'ADD_TO_CONTEXT':
          handleAddToContext(ws, data.params);
          break;
          
        case 'LOG_DECISION':
          handleLogDecision(ws, data.params);
          break;
          
        case 'UPDATE_TODO':
          handleUpdateTodo(ws, data.params);
          break;
          
        case 'MAP_PROJECT_STRUCTURE':
          handleMapProjectStructure(ws, data.params);
          break;
          
        case 'GET_PROJECT_STRUCTURE':
          handleGetProjectStructure(ws);
          break;
          
        // Slash commands
        case '/remember':
          handleRemember(ws, data.params);
          break;
          
        case '/done':
          handleDone(ws, data.params);
          break;
          
        case '/map':
          handleMapProjectStructure(ws, {});
          break;
          
        case '/decision':
          handleDecisionCommand(ws, data.params);
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            data: `Unknown command: ${data.command}`
          }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: error.message
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Command handlers
async function handleReadMemory(ws, params) {
  try {
    const { fileName } = params;
    const content = await readMemoryFile(fileName);
    
    ws.send(JSON.stringify({
      type: 'memory_content',
      data: {
        fileName,
        content
      }
    }));
  } catch (error) {
    console.error('Error reading memory:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: error.message
    }));
  }
}

async function handleWriteMemory(ws, params) {
  try {
    const { fileName, content } = params;
    const success = await writeMemoryFile(fileName, content);
    
    ws.send(JSON.stringify({
      type: 'write_result',
      data: {
        success,
        fileName
      }
    }));
  } catch (error) {
    console.error('Error writing memory:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: error.message
    }));
  }
}

function handleGetContext(ws) {
  ws.send(JSON.stringify({
    type: 'context',
    data: projectContext
  }));
}

function handleAddToContext(ws, params) {
  const { key, value } = params;
  
  if (Array.isArray(projectContext[key])) {
    // If it's an array property, add to it
    projectContext[key].push(value);
    // Keep only recent items (last 10)
    if (projectContext[key].length > 10) {
      projectContext[key] = projectContext[key].slice(-10);
    }
  } else {
    // Otherwise just set the value
    projectContext[key] = value;
  }
  
  ws.send(JSON.stringify({
    type: 'context_updated',
    data: {
      key,
      value: projectContext[key]
    }
  }));
}

async function handleLogDecision(ws, params) {
  try {
    const { decision, rationale } = params;
    const timestamp = new Date().toISOString();
    const decisionLog = `\n- **${timestamp}**: ${decision}\n  - Rationale: ${rationale}`;
    
    // Read existing decisions
    const decisionsPath = path.join(__dirname, '../memory/decisions.md');
    let content = await fs.readFile(decisionsPath, 'utf8');
    
    // Append new decision
    content += decisionLog;
    
    // Write back to file
    await fs.writeFile(decisionsPath, content, 'utf8');
    
    ws.send(JSON.stringify({
      type: 'decision_logged',
      data: {
        timestamp,
        decision
      }
    }));
  } catch (error) {
    console.error('Error logging decision:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: error.message
    }));
  }
}

async function handleUpdateTodo(ws, params) {
  try {
    const { task, completed } = params;
    const todosPath = path.join(__dirname, '../memory/todos.md');
    let content = await fs.readFile(todosPath, 'utf8');
    
    // Replace the task status
    const uncheckedPattern = `- [ ] ${task}`;
    const checkedPattern = `- [x] ${task}`;
    
    if (completed) {
      content = content.replace(uncheckedPattern, checkedPattern);
    } else {
      content = content.replace(checkedPattern, uncheckedPattern);
    }
    
    // Write back to file
    await fs.writeFile(todosPath, content, 'utf8');
    
    ws.send(JSON.stringify({
      type: 'todo_updated',
      data: {
        task,
        completed
      }
    }));
  } catch (error) {
    console.error('Error updating todo:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: error.message
    }));
  }
}

async function handleMapProjectStructure(ws, params) {
  try {
    const { projectPath } = params || {};
    const rootPath = projectPath || path.join(__dirname, '../..');
    
    // Create project mapper
    const mapper = new ProjectMapper(rootPath);
    
    // Analyze project structure
    ws.send(JSON.stringify({
      type: 'status',
      data: 'Analyzing project structure...'
    }));
    
    const connectionMap = await mapper.analyzeProject();
    
    // Generate diagram
    ws.send(JSON.stringify({
      type: 'status',
      data: 'Generating diagram...'
    }));
    
    const diagram = mapper.generateMermaidDiagram();
    
    // Store in project context
    projectContext.projectStructure = {
      connectionMap,
      diagram,
      timestamp: new Date().toISOString()
    };
    
    // Save diagram to memory
    await writeMemoryFile('structure.mmd', diagram);
    
    // Save connection map as JSON
    await writeMemoryFile('structure.json', JSON.stringify(connectionMap, null, 2));
    
    ws.send(JSON.stringify({
      type: 'project_structure',
      data: {
        connectionMap,
        diagram
      }
    }));
  } catch (error) {
    console.error('Error mapping project structure:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: error.message
    }));
  }
}

function handleGetProjectStructure(ws) {
  if (projectContext.projectStructure) {
    ws.send(JSON.stringify({
      type: 'project_structure',
      data: projectContext.projectStructure
    }));
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      data: 'Project structure has not been mapped yet. Use MAP_PROJECT_STRUCTURE command first.'
    }));
  }
}

// Slash command handlers
async function handleRemember(ws, params) {
  try {
    const { text } = params;
    if (!text) {
      throw new Error('No text provided for /remember command');
    }
    
    const timestamp = new Date().toISOString();
    const memoryEntry = `\n- **${timestamp}**: ${text}`;
    
    // Add to memory.md if it exists, otherwise create it
    const memoryPath = path.join(__dirname, '../memory/memory.md');
    
    if (!await fs.pathExists(memoryPath)) {
      await fs.writeFile(memoryPath, '# Project Memory\n\n' + memoryEntry, 'utf8');
    } else {
      await fs.appendFile(memoryPath, memoryEntry, 'utf8');
    }
    
    // Add to context
    projectContext.memories.push({
      timestamp,
      text
    });
    
    // Keep only recent memories in context (last 20)
    if (projectContext.memories.length > 20) {
      projectContext.memories = projectContext.memories.slice(-20);
    }
    
    ws.send(JSON.stringify({
      type: 'memory_added',
      data: {
        timestamp,
        text
      }
    }));
  } catch (error) {
    console.error('Error handling /remember command:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: error.message
    }));
  }
}

async function handleDone(ws, params) {
  try {
    const { task } = params;
    if (!task) {
      throw new Error('No task provided for /done command');
    }
    
    // Mark task as complete in todos.md
    await updateTodo(task, true);
    
    // Add entry to changelog.md
    const timestamp = new Date().toISOString();
    const changelogEntry = `\n- **${timestamp}**: Completed task "${task}"`;
    
    const changelogPath = path.join(__dirname, '../memory/changelog.md');
    await fs.appendFile(changelogPath, changelogEntry, 'utf8');
    
    ws.send(JSON.stringify({
      type: 'task_completed',
      data: {
        timestamp,
        task
      }
    }));
  } catch (error) {
    console.error('Error handling /done command:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: error.message
    }));
  }
}

async function handleDecisionCommand(ws, params) {
  try {
    const { decision, rationale } = params;
    if (!decision) {
      throw new Error('No decision provided for /decision command');
    }
    
    // Log the decision
    await logDecision(decision, rationale || 'No rationale provided');
    
    ws.send(JSON.stringify({
      type: 'decision_logged',
      data: {
        timestamp: new Date().toISOString(),
        decision,
        rationale
      }
    }));
  } catch (error) {
    console.error('Error handling /decision command:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: error.message
    }));
  }
}

// REST API endpoints
app.get('/', (req, res) => {
  res.send('CommanderMCP is running!');
});

// Get current project context
app.get('/api/context', (req, res) => {
  res.json(projectContext);
});

// Get project structure
app.get('/api/structure', (req, res) => {
  if (projectContext.projectStructure) {
    res.json(projectContext.projectStructure);
  } else {
    res.status(404).json({ error: 'Project structure has not been mapped yet' });
  }
});

// Get project structure diagram
app.get('/api/structure/diagram', (req, res) => {
  if (projectContext.projectStructure && projectContext.projectStructure.diagram) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(projectContext.projectStructure.diagram);
  } else {
    res.status(404).json({ error: 'Project structure diagram not available' });
  }
});

// Get memory entries
app.get('/api/memories', (req, res) => {
  res.json(projectContext.memories);
});

// Server start
server.listen(port, () => {
  console.log(`CommanderMCP listening at http://localhost:${port}`);
  console.log('WebSocket server is running');
}); 