# Understanding the Model Context Protocol (MCP)

The Model Context Protocol (MCP) is an emerging standard that allows AI coding assistants to access external tools and context sources. AgentBrainMCP implements this protocol to provide persistent memory for AI assistants across different IDEs and platforms.

## What is MCP?

MCP is a protocol that enables AI models to:

1. **Access external tools**: Connect to databases, file systems, APIs, and other resources
2. **Maintain context**: Preserve information across multiple interactions
3. **Share capabilities**: Use the same tools across different AI assistants
4. **Extend functionality**: Add new capabilities without modifying the core AI model

Think of MCP as a standardized way for AI assistants to communicate with external systems, similar to how REST APIs allow web services to communicate.

## How AgentBrainMCP Implements MCP

AgentBrainMCP acts as an MCP server that provides memory services to AI coding assistants. It:

1. Exposes a REST API at `http://localhost:9000` (default)
2. Provides endpoints for reading and writing memory files
3. Implements slash commands for common memory operations
4. Offers project structure mapping capabilities

## MCP Integration Examples

### Cursor

```json
// .cursor/agentbrain.json
{
  "enabled": true,
  "url": "http://localhost:9000",
  "memoryPath": "./memory",
  "autoSync": true,
  "description": "AgentBrainMCP for long-term memory and context"
}
```

### GitHub Copilot

```json
// .github/copilot/mcp.json
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

### Claude Code

Claude Code uses a slightly different approach with CLAUDE.md files, but the concept is similar:

```markdown
# Project Context

@memory/project.json
@memory/architecture.md
@memory/decisions.md
```

### Cline (Claude Developer)

```json
// .cline/config.json
{
  "mcp": {
    "agentbrain": {
      "enabled": true,
      "url": "http://localhost:9000",
      "description": "AgentBrainMCP for long-term memory"
    }
  }
}
```

## MCP API Endpoints

AgentBrainMCP exposes these MCP-compatible endpoints:

- `GET /api/context`: Get current project context
- `GET /api/memory/{filename}`: Read a specific memory file
- `POST /api/memory/{filename}`: Update a memory file
- `GET /api/structure`: Get project structure
- `POST /api/command`: Execute a slash command

## Benefits of Using MCP

1. **Tool interoperability**: Use the same memory system across different AI assistants
2. **Consistent experience**: Maintain the same context regardless of which assistant you use
3. **Future-proof**: As new AI assistants emerge, they can connect to your existing memory
4. **Extensible**: Add new capabilities to your AI assistants without waiting for vendor updates

## MCP vs. Proprietary Memory Systems

Many AI coding assistants have their own memory systems:

- **Cursor**: Uses `.cursor/rules` and `.cursorrules`
- **Windsurf**: Uses `.windsurfrules` and `global_rules.md`
- **Cody**: Uses `*.rule.md` files in `.sourcegraph/`
- **Claude Code**: Uses `CLAUDE.md` files

While these systems work well within their ecosystems, MCP provides a standardized way to share context across multiple assistants, giving you more flexibility and preventing vendor lock-in.

## Future of MCP

The Model Context Protocol is still evolving, with more AI assistants adding support. As the ecosystem grows, we expect to see:

1. More standardized command formats
2. Enhanced security features
3. Broader tool integration
4. Cross-assistant workflows

AgentBrainMCP will continue to evolve alongside the MCP standard, ensuring compatibility with the latest AI coding assistants while maintaining its core focus on providing persistent, structured memory for your projects. 