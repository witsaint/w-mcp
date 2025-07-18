import type { z, ZodLiteral, ZodObject } from 'zod';
import type {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  Result,
} from '@modelcontextprotocol/sdk/types.js';

export type TToolRequest = z.infer<typeof CallToolRequestSchema>;
export type TPromptRequest = z.infer<typeof GetPromptRequestSchema>;

export type ToolRequest = (request: TToolRequest) => Promise<Result>;
export type PromptRequest = (request: TPromptRequest) => Promise<Result>;

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
