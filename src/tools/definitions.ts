import { z } from "zod";

export const ProjectNameSchema = z.string().describe("Unique identifier for the project");

export const CreateMemorySchema = z.object({
  project_name: ProjectNameSchema,
});

export const AddContentSchema = z.object({
  project_name: ProjectNameSchema,
  content: z.string().describe("The text content to store"),
  title: z.string().optional().describe("Title of the document"),
  metadata: z.record(z.string(), z.any()).optional().describe("Key-value pairs for metadata"),
  tags: z.array(z.string()).optional().describe("Array of string tags"),
  enable_embedding: z.boolean().default(false).optional().describe("Enable vector embedding generation (requires AI provider setup)"),
});

export const SearchMemorySchema = z.object({
  project_name: ProjectNameSchema,
  query: z.string().describe("The search query"),
  limit: z.number().default(5).optional(),
  mode: z.enum(["auto", "lex", "sem"]).default("auto").optional().describe("Search mode: 'lex' (keyword), 'sem' (semantic/vector), 'auto' (smart selection)"),
});

export const AskMemorySchema = z.object({
  project_name: ProjectNameSchema,
  question: z.string().describe("The natural language question to ask"),
});

