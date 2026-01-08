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

      let results;
      if (args.query === "*") {
        // Use timeline for "list all" functionality
        // @ts-ignore - timeline is available in SDK but might be missing in type definitions
        if (typeof mem.timeline === 'function') {
             // @ts-ignore
             results = await mem.timeline({ k: args.limit });
        } else {
             // Fallback if timeline is missing
             results = await mem.find(undefined, { k: args.limit });
        }
      } else {
        results = await mem.find(args.query, {
          k: args.limit,
          mode: args.mode,
        });
      }



      // Handle both standard search results (with .hits) and timeline array
      // @ts-ignore
      const hits = Array.isArray(results) ? results : (results.hits || []);
      
      const formatted = hits
        .map((hit: any) => {
          return `[Title: ${hit.title || "Untitled"}]\n${
            hit.snippet || hit.text || hit.preview
          }\n(Score: ${hit.score || "N/A"})`;
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
