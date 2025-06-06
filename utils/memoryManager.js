const fs = require('fs-extra');
const path = require('path');

const memoryPath = path.join(__dirname, '..', 'memory');

/**
 * Read a memory file
 * @param {string} fileName - The name of the file to read
 * @returns {Promise<string|null>} - The content of the file or null if error
 */
async function readMemoryFile(fileName) {
  try {
    const filePath = path.join(memoryPath, fileName);
    const data = await fs.readFile(filePath, 'utf8');
    return data;
  } catch (error) {
    console.error(`Error reading memory file ${fileName}:`, error);
    return null;
  }
}

/**
 * Write to a memory file
 * @param {string} fileName - The name of the file to write
 * @param {string} content - The content to write
 * @returns {Promise<boolean>} - True if successful, false if error
 */
async function writeMemoryFile(fileName, content) {
  try {
    const filePath = path.join(memoryPath, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to memory file ${fileName}:`, error);
    return false;
  }
}

/**
 * Append content to a memory file
 * @param {string} fileName - The name of the file to append to
 * @param {string} content - The content to append
 * @returns {Promise<boolean>} - True if successful, false if error
 */
async function appendToMemoryFile(fileName, content) {
  try {
    const filePath = path.join(memoryPath, fileName);
    
    // Create file if it doesn't exist
    if (!await fs.pathExists(filePath)) {
      // Add appropriate header based on file type
      let header = '';
      if (fileName === 'memory.md') {
        header = '# Project Memory\n\n';
      } else if (fileName === 'decisions.md') {
        header = '# Design Decisions\n\n';
      } else if (fileName === 'changelog.md') {
        header = '# Changelog\n\n';
      } else if (fileName === 'todos.md') {
        header = '# To-Do List\n\n';
      } else if (fileName === 'development-guidelines.md') {
        header = '# Development Guidelines\n\n';
      }
      
      await fs.writeFile(filePath, header + content, 'utf8');
    } else {
      await fs.appendFile(filePath, content, 'utf8');
    }
    return true;
  } catch (error) {
    console.error(`Error appending to memory file ${fileName}:`, error);
    return false;
  }
}

/**
 * Get all memory files
 * @returns {Promise<Array>} - Array of memory file objects
 */
async function getAllMemoryFiles() {
  try {
    const files = await fs.readdir(memoryPath);
    
    const memoryFiles = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(memoryPath, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime
        };
      })
    );
    
    return memoryFiles;
  } catch (error) {
    console.error('Error reading memory directory:', error);
    return [];
  }
}

/**
 * Update a todo item in todos.md
 * @param {string} task - The task text
 * @param {boolean} completed - Whether the task is completed
 * @returns {Promise<boolean>} - True if successful, false if error
 */
async function updateTodo(task, completed) {
  try {
    const todosPath = path.join(memoryPath, 'todos.md');
    
    // Create todos.md if it doesn't exist
    if (!await fs.pathExists(todosPath)) {
      const initialContent = '# To-Do List\n\n';
      await fs.writeFile(todosPath, initialContent, 'utf8');
      
      // If we're marking a task as complete but it doesn't exist yet, add it
      if (completed) {
        await addTodo(task, completed);
        return true;
      }
      
      return false;
    }
    
    let content = await fs.readFile(todosPath, 'utf8');
    
    // Replace the task status
    const uncheckedPattern = `- [ ] ${task}`;
    const checkedPattern = `- [x] ${task}`;
    
    if (completed) {
      // If the task doesn't exist, add it
      if (!content.includes(uncheckedPattern) && !content.includes(checkedPattern)) {
        await addTodo(task, true);
        return true;
      }
      
      content = content.replace(uncheckedPattern, checkedPattern);
    } else {
      // If the task doesn't exist, add it
      if (!content.includes(uncheckedPattern) && !content.includes(checkedPattern)) {
        await addTodo(task, false);
        return true;
      }
      
      content = content.replace(checkedPattern, uncheckedPattern);
    }
    
    // Write back to file
    await fs.writeFile(todosPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating todo:', error);
    return false;
  }
}

/**
 * Add a new todo item to todos.md
 * @param {string} task - The task text
 * @param {boolean} completed - Whether the task is completed (default: false)
 * @returns {Promise<boolean>} - True if successful, false if error
 */
async function addTodo(task, completed = false) {
  try {
    const todosPath = path.join(memoryPath, 'todos.md');
    const taskPrefix = completed ? '- [x] ' : '- [ ] ';
    const newTask = `\n${taskPrefix}${task}`;
    
    // Create todos.md if it doesn't exist
    if (!await fs.pathExists(todosPath)) {
      const initialContent = '# To-Do List\n' + newTask;
      await fs.writeFile(todosPath, initialContent, 'utf8');
    } else {
      await fs.appendFile(todosPath, newTask, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding todo:', error);
    return false;
  }
}

/**
 * Log a new decision to decisions.md
 * @param {string} decision - The decision text
 * @param {string} rationale - The rationale for the decision
 * @returns {Promise<boolean>} - True if successful, false if error
 */
async function logDecision(decision, rationale) {
  try {
    const decisionsPath = path.join(memoryPath, 'decisions.md');
    const timestamp = new Date().toISOString();
    const decisionLog = `\n- **${timestamp}**: ${decision}\n  - Rationale: ${rationale}`;
    
    // Create decisions.md if it doesn't exist
    if (!await fs.pathExists(decisionsPath)) {
      const initialContent = '# Design Decisions\n' + decisionLog;
      await fs.writeFile(decisionsPath, initialContent, 'utf8');
    } else {
      await fs.appendFile(decisionsPath, decisionLog, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error('Error logging decision:', error);
    return false;
  }
}

/**
 * Update the project.json file
 * @param {Object} updates - The updates to apply to project.json
 * @returns {Promise<boolean>} - True if successful, false if error
 */
async function updateProjectInfo(updates) {
  try {
    const projectPath = path.join(memoryPath, 'project.json');
    
    // Create project.json if it doesn't exist
    if (!await fs.pathExists(projectPath)) {
      const initialData = {
        name: 'Project',
        purpose: 'A project with MCP Agent memory',
        languages: [],
        dependencies: {},
        key_frameworks: []
      };
      
      const updatedData = { ...initialData, ...updates };
      await fs.writeFile(projectPath, JSON.stringify(updatedData, null, 2), 'utf8');
      return true;
    }
    
    // Update existing project.json
    const projectData = JSON.parse(await fs.readFile(projectPath, 'utf8'));
    
    // Apply updates
    const updatedData = { ...projectData, ...updates };
    
    // Write back to file
    await fs.writeFile(projectPath, JSON.stringify(updatedData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating project info:', error);
    return false;
  }
}

/**
 * Create a development guideline entry
 * @param {string} guideline - The guideline to add
 * @param {string} category - The category for the guideline
 * @returns {Promise<boolean>} - True if successful, false if error
 */
async function addGuideline(guideline, category = 'General') {
  try {
    const guidelinesPath = path.join(memoryPath, 'development-guidelines.md');
    
    // Create development-guidelines.md if it doesn't exist
    if (!await fs.pathExists(guidelinesPath)) {
      const initialContent = '# Development Guidelines\n\n## ' + category + '\n\n- ' + guideline;
      await fs.writeFile(guidelinesPath, initialContent, 'utf8');
      return true;
    }
    
    // Read existing guidelines
    let content = await fs.readFile(guidelinesPath, 'utf8');
    
    // Check if category exists
    const categoryRegex = new RegExp(`## ${category}`, 'i');
    if (categoryRegex.test(content)) {
      // Find the position of the category
      const categoryPos = content.search(categoryRegex);
      
      // Find the position of the next category or end of file
      let nextCategoryPos = content.indexOf('## ', categoryPos + category.length + 3);
      if (nextCategoryPos === -1) {
        nextCategoryPos = content.length;
      }
      
      // Insert guideline at the end of the category
      const beforeCategory = content.substring(0, nextCategoryPos);
      const afterCategory = content.substring(nextCategoryPos);
      content = beforeCategory + '\n- ' + guideline + afterCategory;
    } else {
      // Add new category and guideline
      content += '\n\n## ' + category + '\n\n- ' + guideline;
    }
    
    // Write back to file
    await fs.writeFile(guidelinesPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error adding guideline:', error);
    return false;
  }
}

module.exports = {
  readMemoryFile,
  writeMemoryFile,
  appendToMemoryFile,
  getAllMemoryFiles,
  updateTodo,
  addTodo,
  logDecision,
  updateProjectInfo,
  addGuideline
}; 