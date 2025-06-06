# Integrating MCP Agent with Cursor

The MCP (Master Control Program) Agent is designed to work seamlessly with Cursor's rules system, providing persistent memory and context for your AI coding assistant.

## Setup

1. Start the MCP Agent in your project:
   ```bash
   cd path/to/your/project
   npx context-aware-mcp start
   ```

2. Create a `.cursor` directory in your project root if it doesn't exist:
   ```bash
   mkdir -p .cursor
   ```

3. Create a `mcp.json` configuration file:
   ```bash
   touch .cursor/mcp.json
   ```

4. Add the following configuration to `mcp.json`:
   ```json
   {
     "enabled": true,
     "serverUrl": "http://localhost:4000",
     "memoryPath": "./memory",
     "autoSync": true
   }
   ```

5. Create a Cursor rule file that loads the MCP Agent context:

## Cursor Rule Integration

Create a file `.cursor/rules/mcp-agent.mdc` with the following content:

```markdown
# MCP Agent Integration

This rule integrates the MCP (Master Control Program) Agent with Cursor to provide persistent memory and context awareness.

## Project Context

The MCP Agent maintains the following memory files for this project:

- project.json: Project metadata and goals
- architecture.md: System architecture documentation
- decisions.md: Chronological record of design decisions with rationales
- changelog.md: Historical record of code changes and feature completions
- todos.md: Active to-do list (tasks remaining)
- structure.mmd: Mermaid diagram showing project file and component relationships
- structure.json: Detailed JSON representation of project structure connections
- development-guidelines.md: Coding conventions and process rules

## Behavior Rules

- Always load and consider memory files at the start of your response
- Use memory contents as facts when generating code or explanations
- When writing code or explanations, search the codebase for relevant context
- Before answering, check if information is already documented in architecture.md or decisions.md
- For every completed task or discovered issue, update the relevant memory files
- If you learn a new coding guideline or project convention, append it to development-guidelines.md
- End each answer by summarizing any changes made to memory files
- Follow Markdown formatting for memory files (use headers and lists)
- Do not generate any code or text that conflicts with the instructions in memory files
- Use the project structure map to understand relationships between files

## Slash Commands

The following slash commands are available through the MCP Agent:

- /remember [text]: Save important information to memory
- /done [task]: Mark a todo as complete and log it
- /map: Generate an updated project structure map
- /decision [decision] [rationale]: Log a new design decision

Think of yourself as the project's institutional memory, ensuring continuity and coherence even as the codebase evolves.
```

## Using MCP Agent with Cursor

Once the integration is set up, Cursor will automatically load the MCP Agent context for every prompt. You can use the slash commands directly in your Cursor chat to interact with the MCP Agent.

For example:

1. To remember important information:
   ```
   /remember We decided to use React for the frontend because of its component-based architecture
   ```

2. To mark a task as complete:
   ```
   /done Implement user authentication
   ```

3. To log a design decision:
   ```
   /decision Use PostgreSQL for the database Needed better support for complex queries and transactions
   ```

4. To generate a project structure map:
   ```
   /map
   ```

## Accessing Memory Files

You can access the memory files directly in your project's `memory` directory, or through the MCP Agent's API:

- Web UI: http://localhost:4000
- API Endpoints:
  - GET `/api/context`: Get current project context
  - GET `/api/structure`: Get project structure
  - GET `/api/structure/diagram`: Get project structure diagram
  - GET `/api/memories`: Get memory entries

## Troubleshooting

If you encounter issues with the MCP Agent integration:

1. Make sure the MCP Agent is running (`npx context-aware-mcp status`)
2. Check that the `.cursor/mcp.json` configuration is correct
3. Verify that Cursor can access the MCP Agent server (default: http://localhost:4000)
4. Restart Cursor if necessary

For more information, see the [MCP Agent documentation](../README.md). 