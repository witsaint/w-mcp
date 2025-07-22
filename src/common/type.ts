import type { z, ZodLiteral, ZodObject } from 'zod';
import type {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ReadResourceRequestSchema,
  Result,
} from '@modelcontextprotocol/sdk/types.js';

export type TToolRequest = z.infer<typeof CallToolRequestSchema>;
export type TPromptRequest = z.infer<typeof GetPromptRequestSchema>;
export type TResourceRequest = z.infer<typeof ReadResourceRequestSchema>;

export type ToolRequest = (request: TToolRequest) => Promise<Result>;
export type PromptRequest = (request: TPromptRequest) => Promise<Result>;
export type ResourceRequest = (request: TResourceRequest) => Promise<Result>;

export interface IToolConfig {
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  handler: ToolRequest;
}

export interface ITool {
  description: string;
  schema: Result;
  handler: ToolRequest;
}

export interface IPromptConfig {
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  handler: PromptRequest;
}

export interface IPrompt {
  description: string;
  schema: Result;
  handler: PromptRequest;
}

export interface IResourceConfig {
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  handler: ResourceRequest;
}

export interface IResource {
  description: string;
  schema: Result;
  handler: ResourceRequest;
}
