import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchMemorySchema } from "./definitions.js";
import { MemoryManager } from "../memory_manager.js";
import { z } from "zod";

type SearchMemoryArgs = z.infer<typeof SearchMemorySchema>;

export function registerSearchMemory(server: McpServer) {
  // @ts-ignore
  server.tool(
    "search_memory",
    "Search for content in the project's memory using semantic search.",
    SearchMemorySchema.shape as any,
    async (args: SearchMemoryArgs) => {
      const manager = MemoryManager.getInstance();
      const mem = await manager.getMemory(args.project_name);

      const results = await mem.find(args.query, {
        k: args.limit,
        mode: args.mode,
      });

      const hits = results.hits || [];
      const formatted = hits
        .map((hit: any) => {
          return `[Title: ${hit.title || "Untitled"}]\n${
            hit.snippet || hit.text
          }\n(Score: ${hit.score})`;
        })
        .join("\n\n---\n\n");

      return {
        content: [
          {
            type: "text",
            text: formatted || "No results found.",
          },
        ],
      };
    }
  );
}
