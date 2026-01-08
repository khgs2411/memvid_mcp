import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateMemory } from "./create.js";
import { registerAddContent } from "./add.js";
import { registerSearchMemory } from "./search.js";
import { registerAskMemory } from "./ask.js";
import { GetProjectContextSchema, getProjectContext } from "./context.js";
import { registerDeleteProject } from "./delete.js";

export function registerAllTools(server: McpServer) {
    server.tool(
        "memvid_get_project_context",
        "Get context about the current project (e.g. inferred project name from CWD) to help the agent decide which memory project to use.",
        GetProjectContextSchema.shape,
        async () => getProjectContext()
    );

    registerCreateMemory(server);
    registerAddContent(server);
    registerSearchMemory(server);
    registerDeleteProject(server);

    if (process.env.OPENAI_API_KEY) {
        registerAskMemory(server);
        console.error("AskMemory tool enabled (API key found).");
    } else {
        console.error("AskMemory tool disabled (no OPENAI_API_KEY found).");
    }
}
