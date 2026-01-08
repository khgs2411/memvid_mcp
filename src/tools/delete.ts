import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MemoryManager } from "../memory_manager.js";

const DeleteProjectSchema = z.object({
  project_name: z.string().describe("The name of the project memory to delete."),
});

export function registerDeleteProject(server: McpServer) {
  // @ts-ignore
  server.tool(
    "memvid_delete_project",
    "Permanently delete a project's memory file. This action is irreversible.",
    DeleteProjectSchema.shape as any,
    async (args: z.infer<typeof DeleteProjectSchema>) => {
      const manager = MemoryManager.getInstance();
      const success = await manager.deleteProject(args.project_name);

      return {
        content: [
          {
            type: "text",
            text: success
              ? `Successfully deleted memory for project '${args.project_name}'.`
              : `Project '${args.project_name}' not found or could not be deleted.`,
          },
        ],
      };
    }
  );
}
