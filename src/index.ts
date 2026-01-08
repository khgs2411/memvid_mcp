#!/usr/bin/env node
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";

// Create MCP Server
const server = new McpServer({
  name: "memvid-mcp-server",
  version: "1.0.0",
});

// Register all tools
registerAllTools(server);

// Start Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memvid MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main loop:", error);
  process.exit(1);
});
