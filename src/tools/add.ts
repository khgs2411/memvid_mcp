import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AddContentSchema } from "./definitions.js";
import { MemoryManager } from "../memory_manager.js";
import { z } from "zod";

type AddContentArgs = z.infer<typeof AddContentSchema>;

export function registerAddContent(server: McpServer) {
  // @ts-ignore
  server.tool(
    "add_content",
    "Add a text document/content to the project's memory.",
    AddContentSchema.shape as any,
    async (args: AddContentArgs) => {
      const manager = MemoryManager.getInstance();
      const mem = await manager.getMemory(args.project_name);

      await mem.put({
        text: args.content,
        title: args.title,
        metadata: args.metadata,
        labels: args.tags,
        enableEmbedding: args.enable_embedding,
      });

      return {
        content: [
          {
            type: "text",
            text: `Added content to '${args.project_name}' memory.`,
          },
        ],
      };
    }
  );
}
