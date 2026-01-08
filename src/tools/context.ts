import { z } from "zod";
import path from "path";

export const GetProjectContextSchema = z.object({});

export async function getProjectContext() {
  const cwd = process.cwd();
  const suggested_project_name = path.basename(cwd);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          suggested_project_name,
          cwd,
          hint: "Use 'suggested_project_name' as the 'project_name' argument for other tools if you are unsure."
        }, null, 2),
      },
    ],
  };
}
