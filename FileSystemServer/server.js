const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.FILESYSTEM_PORT || 4000;

app.use(express.json({ limit: '50mb' }));

// Store file changes for context tracking
const fileChangeHistory = {};

// Initialize file watcher
const watcher = chokidar.watch(['../**/*.js', '../**/*.json', '../**/*.md'], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

// Track file changes for context building
watcher
  .on('change', path => {
    const timestamp = new Date().toISOString();
    if (!fileChangeHistory[path]) {
      fileChangeHistory[path] = [];
    }
    fileChangeHistory[path].push({ timestamp, type: 'modified' });
    console.log(`File ${path} has been changed at ${timestamp}`);
  })
  .on('add', path => {
    const timestamp = new Date().toISOString();
    fileChangeHistory[path] = [{ timestamp, type: 'created' }];
    console.log(`File ${path} has been added at ${timestamp}`);
  });

// Helper to check if a path is allowed
function isPathAllowed(fullPath) {
  return ALLOWED_DIRECTORIES.some(dir => {
    const resolvedDir = path.resolve(dir);
    return fullPath.startsWith(resolvedDir);
  });
}

// API Routes

// Get file content
app.get('/api/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    const fullPath = path.resolve(filePath);
    if (!isPathAllowed(fullPath)) {
      return res.status(403).json({ error: 'Access to this path is not allowed by security policy.' });
    }
    const content = await fs.readFile(fullPath, 'utf8');
    return res.json({
      path: filePath,
      content,
      lastModified: (await fs.stat(fullPath)).mtime
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Write to file
app.post('/api/file', async (req, res) => {
  try {
    const { filePath, content } = req.body;
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
    }
    const fullPath = path.resolve(filePath);
    if (!isPathAllowed(fullPath)) {
      return res.status(403).json({ error: 'Access to this path is not allowed by security policy.' });
    }
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf8');
    return res.json({ 
      success: true, 
      path: filePath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error writing file:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get memory files
app.get('/api/memory', async (req, res) => {
  try {
    const memoryDir = path.resolve('../memory');
    const files = await fs.readdir(memoryDir);
    
    const memoryFiles = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(memoryDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime
        };
      })
    );
    
    return res.json(memoryFiles);
  } catch (error) {
    console.error('Error reading memory directory:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get file change history
app.get('/api/changes', (req, res) => {
  const filePath = req.query.path;
  
  if (filePath) {
    return res.json(fileChangeHistory[filePath] || []);
  }
  
  return res.json(fileChangeHistory);
});

// Server start
app.listen(port, () => {
  console.log(`File System Server listening at http://localhost:${port}`);
  console.log('Watching for file changes...');
}); 