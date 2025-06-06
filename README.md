# AgentBrainMCP

A context-aware memory system for AI coding assistants.

## 🚀 Super Simple Setup

### Option 1: Quick Start (Local)
```bash
# Clone and install
git clone https://github.com/ProgrammerSohail/AgentBrainMCP.git
cd AgentBrainMCP
npm install

# Start everything with one command
npm start
```

### Option 2: Global Installation
```bash
# Install globally
npm install -g agentbrain-mcp

# Run from anywhere
AgentBrainMCP
```

## 🧠 What It Does

AgentBrainMCP provides long-term memory for AI coding assistants like Cursor, GitHub Copilot, Claude, etc. It:

- Stores project context, decisions, and architecture
- Tracks file changes and project evolution
- Provides memory that persists across coding sessions
- Makes AI assistants smarter and more context-aware
- Maps project structure to visualize file and component relationships
- Implements best practices from industry AI coding tools

## 🤖 Using with AI Assistants

1. Start AgentBrainMCP: `npm start`
2. Type `prompt` in the console to see the starter prompt
3. Copy this prompt into your AI assistant
4. The AI can now access your project's memory!

## 🔌 IDE & AI Assistant Integrations

AgentBrainMCP works with most popular AI coding assistants through the [Model Context Protocol (MCP)](docs/model-context-protocol.md):

### Cursor
Cursor has built-in support for context-aware memory via its Rules system:

```json
{
   "mcpAgent": {
      "url": "http://localhost:9000",
      "description": "MCP Agent for long-term memory and context"
   }
}
```

Create `.cursor/rules/agentbrain.mdc` with the starter prompt to fully integrate.

### Claude Code
Claude Code seamlessly integrates with AgentBrainMCP:

1. Install Claude Code CLI
2. Create a `CLAUDE.md` file in your project that references AgentBrainMCP
3. Claude Code will automatically load project memory when started

### GitHub Copilot
GitHub Copilot now supports Agent Mode and MCP in JetBrains and Eclipse:

```json
{ 
    "servers": { 
        "AgentBrain": { 
            "command": "npx", 
            "args": [ 
                "agentbrain-mcp", 
                "start" 
            ]
        } 
    } 
}
```

### Windsurf (formerly Codeium)
Windsurf Editor has a sophisticated Context-Awareness Engine:

1. Create `.windsurf/rules` directory
2. Add a `.windsurfrules` file referencing AgentBrainMCP

### Other MCP-Compatible Assistants
Works with any AI coding assistant that supports the Model Context Protocol:

- Cline (Claude Developer)
- Roo Code
- Qodo
- Tabnine
- And more!

## 🗺️ Project Structure Mapping

AgentBrainMCP can analyze your project's structure and create a visual map of connections between files and components:

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

AgentBrainMCP implements best practices from industry tools like Cursor, Cody, Windsurf, and Claude Code:

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
      "url": "http://localhost:9000",
      "description": "MCP Agent for long-term memory and context"
    }
}
```

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

When AgentBrainMCP is running:
- `help`: Show available commands
- `status`: Check server status
- `restart`: Restart both servers
- `prompt`: Show the starter prompt for AI assistants
- `map`: Generate project structure map
- `quit`: Stop servers and exit

## 🤔 Why Context Matters in AI Coding

Modern AI coding assistants embedded in IDEs rely heavily on context windows and external memory to handle large projects. Without additional memory, these assistants "quickly forget" earlier decisions once the context window is full. For example, when a codebase grows, the AI loses track of high-level design and repeats work unless it has access to stored design decisions and history.

AgentBrainMCP solves this by providing persistent memory that remains available across coding sessions, ensuring your AI assistant maintains a complete understanding of your project.

## 👨‍💻 Created By

ProgrammerSohail 