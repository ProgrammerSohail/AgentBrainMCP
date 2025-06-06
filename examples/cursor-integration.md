# Integrating MCP Agent with Cursor

This guide shows how to use MCP Agent with Cursor to give your AI assistant long-term memory.

## Setup

1. Start MCP Agent:
```bash
npm start
```

2. Create a `.cursor/rules` file in your project with this content:

```markdown
# MCP Agent Integration

You have access to the MCP Agent which provides long-term memory for this project.

## Memory Access

You can access project memory through these endpoints:
- FileSystemServer: http://localhost:3000
- CommanderMCP: ws://localhost:4000

## Memory Files

The following memory files are available:
- project.json: Project metadata and purpose
- architecture.md: System design and structure
- decisions.md: Important design decisions with rationales
- changelog.md: Record of changes to the project
- todos.md: Current task list

## Commands

When you need to access project memory, you should:

1. First check if the information is in the relevant memory file
2. If you need to update project memory, use the appropriate command:
   - For design decisions: Log them in decisions.md with rationales
   - For completed tasks: Update todos.md and add to changelog.md
   - For architecture changes: Update architecture.md

## Example Prompts

To read project metadata:
"Please check the project.json file to understand what this project is about."

To log a decision:
"I've decided to use React for the frontend. Please log this decision with the rationale that it provides a component-based architecture."

To update a todo:
"Mark the 'Set up development environment' task as completed."
```

3. In Cursor, use the following prompt to activate MCP Agent:

```
I'm working on a project that uses MCP Agent for memory. Please check the project memory files to understand the project context before helping me.
```

## How It Works

1. Cursor reads the `.cursor/rules` file and includes it in the AI's context
2. The AI understands how to access the MCP Agent's memory
3. The AI can now read from and write to the project memory files
4. This gives the AI persistent memory across sessions

## Tips

- Use specific prompts that reference memory files
- Ask the AI to check memory files before making decisions
- Have the AI update memory files after important changes
- Use the MCP Agent console to view and manage memory 