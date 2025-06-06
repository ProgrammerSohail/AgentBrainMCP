# Design Decisions

- **2024-01-01**: Decided to use separate servers for file system operations and command handling to keep concerns separated. `FileSystemServer` will handle file I/O, and `CommanderMCP` will handle high-level commands. 