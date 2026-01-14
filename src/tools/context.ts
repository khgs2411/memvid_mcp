import { z } from "zod";
import path from "path";

import { GetProjectContextSchema } from "./definitions.js";

type GetProjectContextArgs = z.infer<typeof GetProjectContextSchema>;

export async function getProjectContext(args?: GetProjectContextArgs) {
  const cwd = args?.storage_path || process.cwd();
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
