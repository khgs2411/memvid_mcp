# Memvid MCP Server

An [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for [Memvid](https://memvid.com/), enabling AI agents to use persistent, file-based memory.

## Features

- **Project-based Memory**: Create and manage isolated memory files (`.mv2`) for different projects.
- **Add Content**: Store text documents, code snippets, and metadata.
- **Semantic Search**: Find relevant content using Memvid's hybrid search (lexical + semantic).
- **Ask Memory (Optional)**: Ask natural language questions about your stored data (requires OpenAI API Key).

## Installation

```bash
npm install -g memvid-mcp-server
# or
bun add -g memvid-mcp-server
```

## Configuration

This server can be used with any MCP-compliant client (e.g., Claude Desktop, Cursor).

### Environment Variables

| Variable               | Description                                                                                              | Required      |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ------------- |
| `OPENAI_API_KEY`       | Your OpenAI API Key. Required to enable the `ask_memory` tool and for semantic embeddings in some modes. | No (Optional) |
| `MEMVID_LOCAL_STORAGE` | Set to `"1"` to store memory files in `./memvid_mcp` (current directory) instead of `~/.memvid_mcp`.     | No (Optional) |

### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "memvid": {
      "command": "npx",
      "args": ["-y", "memvid-mcp-server"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

> **Note:** If you do not provide `OPENAI_API_KEY`, the `ask_memory` tool will not be available, but you can still use `create_or_open_memory`, `add_content`, and `search_memory` (lexical mode).

## Tools

1.  **`create_or_open_memory`**: Initialize a new project memory or open an existing one.
2.  **`add_content`**: Add text and metadata to the memory.
3.  **`search_memory`**: Search your memory.
4.  **`ask_memory`**: (Optional) Ask questions about your memory using an LLM.

## Development

```bash
# Install dependencies
bun install

# Run locally
bun run src/index.ts

# Build
bun build ./src/index.ts --compile --outfile server
```
