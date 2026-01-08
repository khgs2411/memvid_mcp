import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AskMemorySchema } from "./definitions.js";
import { MemoryManager } from "../memory_manager.js";
import { z } from "zod";

type AskMemoryArgs = z.infer<typeof AskMemorySchema>;

export function registerAskMemory(server: McpServer) {
  // @ts-ignore
  server.tool(
    "ask_memory",
    "Ask a natural language question about the content in the project's memory.",
    AskMemorySchema.shape as any,
    async (args: AskMemoryArgs) => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return {
          content: [
            {
              type: "text",
              text: "Error: OPENAI_API_KEY environment variable is not set.",
            },
          ],
          isError: true,
        };
      }

      try {
        const manager = MemoryManager.getInstance();
        const mem = await manager.getMemory(args.project_name);

        const answer = await mem.ask(args.question, {
          model: "gpt-4o",
          modelApiKey: apiKey,
        });

        // Safely extract text from the opaque answer object
        const answerText = (answer as any).text || (answer as any).answer || JSON.stringify(answer);

        return {
          content: [
            {
              type: "text",
              text: typeof answerText === "string" ? answerText : JSON.stringify(answerText),
            },
          ],
        };
      } catch (e: any) {
         return {
          content: [
            {
              type: "text",
              text: `Error asking question: ${e.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
