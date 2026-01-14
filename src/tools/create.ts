import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CreateMemorySchema } from "./definitions.js";
import { MemoryManager } from "../memory_manager.js";

export function registerCreateMemory(server: McpServer) {
  // @ts-ignore
  server.tool(
    "create_or_open_memory",
    "Initialize or open a Memvid memory file for a specific project.",
    CreateMemorySchema.shape as any,
    async (args: { project_name: string; storage_path?: string }) => {
      const manager = MemoryManager.getInstance();
      const path = manager.getStoragePath(args.project_name, args.storage_path);
      await manager.getMemory(args.project_name, args.storage_path);
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully initialized memory for project '${args.project_name}' at ${path}`,
          },
        ],
      };
    }
  );
}
