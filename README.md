# MCP Agent

A context-aware memory system for AI coding assistants.

## 🚀 Super Simple Setup

### Option 1: Quick Start (Local)
```bash
# Clone and install
git clone https://github.com/yourusername/mcp-agent.git
cd mcp-agent
npm install

# Start everything with one command
npm start
```

### Option 2: Global Installation
```bash
# Install globally
npm install -g mcp-agent

# Run from anywhere
mcp-agent
```

## 🧠 What It Does

MCP Agent provides long-term memory for AI coding assistants like Cursor, GitHub Copilot, Claude, etc. It:

- Stores project context, decisions, and architecture
- Tracks file changes and project evolution
- Provides memory that persists across coding sessions
- Makes AI assistants smarter and more context-aware
- Maps project structure to visualize file and component relationships
- Implements best practices from industry AI coding tools

## 🤖 Using with AI Assistants

1. Start MCP Agent: `npm start`
2. Type `prompt` in the MCP console to see the starter prompt
3. Copy this prompt into your AI assistant
4. The AI can now access your project's memory!

## 🗺️ Project Structure Mapping

MCP Agent can analyze your project's structure and create a visual map of connections between files and components:

```bash
# Map your project structure
npm run map

# Or map a specific project
npm run map /path/to/project
```

This generates:
- `memory/structure.mmd`: Mermaid diagram of project connections
- `memory/structure.json`: Detailed connection data

The diagram shows:
- 📄 Files and their locations
- 🧩 Components defined in those files
- ➡️ Import relationships
- 🔄 Usage connections

This helps AI assistants understand the architecture without scanning every file!

## 🔄 Memory Management

MCP Agent implements best practices from industry tools like Cursor, Cody, Windsurf, and Claude Code:

- **Structured Memory Files**: Organized by category (decisions, todos, etc.)
- **Markdown Formatting**: Clean bullet points under descriptive headings
- **Priority Context**: Focuses on current file → referenced files → pinned modules → memory
- **Slash Commands**: Quick interactions like `/remember`, `/done`, and `/decision`
- **Periodic Summarization**: Keeps memory files concise and relevant

## 💬 Slash Commands

When interacting with AI assistants, you can use these commands:

- `/remember [text]`: Save important information to memory
- `/done [task]`: Mark a todo as complete and log it
- `/map`: Generate an updated project structure map
- `/decision [decision] [rationale]`: Log a new design decision

## 🛠️ Integration Options

### For Cursor/VS Code
See [Cursor Integration Guide](docs/cursor-integration.md) for detailed setup.

```json
{
  "mcpAgent": {
    "fileSystemUrl": "http://localhost:3000",
    "commanderUrl": "ws://localhost:4000"
  }
}
```

### For API Access
- FileSystemServer: `http://localhost:3000`
- CommanderMCP: `ws://localhost:4000`
- Web UI: `http://localhost:4000`

## 📚 Memory Files

All project memory is stored in the `memory/` directory:
- `project.json`: Project metadata and goals
- `architecture.md`: System architecture documentation
- `decisions.md`: Chronological record of design decisions with rationales
- `changelog.md`: Historical record of code changes and feature completions
- `todos.md`: Active to-do list (tasks remaining)
- `structure.mmd`: Mermaid diagram showing project file and component relationships
- `structure.json`: Detailed JSON representation of project structure connections
- `development-guidelines.md`: Coding conventions and process rules

## 📝 Commands

When MCP Agent is running:
- `help`: Show available commands
- `status`: Check server status
- `restart`: Restart both servers
- `prompt`: Show the starter prompt for AI assistants
- `map`: Generate project structure map
- `quit`: Stop servers and exit 