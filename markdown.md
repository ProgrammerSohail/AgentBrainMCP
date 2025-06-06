# Mistakes and Configuration Issues in AgentBrainMCP

## Configuration Mistakes

- **No central `config.json`**: All runtime configuration should be in a single, user-editable file, not just `.env`.
- **No runtime config management**: Users cannot change settings (shell, allowed directories, command limits) without editing code or restarting.
- **No security restrictions**: File and command operations are not restricted to safe directories.
- **No shell or command control**: Cannot set the shell or block dangerous commands.
- **No file operation limits**: No chunking or line limits for file read/write operations.
- **No audit or fuzzy search logging**: No way to review or debug tool usage or search failures.
- **No auto-update or uninstall**: Manual install/update only, with no easy way to keep up to date or remove.
- **Insufficient documentation**: Lacks detailed configuration, security, and troubleshooting guidance.

## General Mistakes

- **Missing best practices for configuration and security**.
- **No clear separation between memory files and operational config**.
- **No warnings about security risks or operational pitfalls**.
- **No instructions for safe configuration changes (e.g., use a separate chat for config changes)**.

---

**Reference:**  
- [DesktopCommanderMCP GitHub](https://github.com/wonderwhy-er/DesktopCommanderMCP)  
- [DesktopCommanderMCP Docs](https://desktopcommander.app/)  