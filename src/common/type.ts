import type { z, ZodLiteral, ZodObject } from 'zod';
import type {
  CallToolRequestSchema,
  Result,
} from '@modelcontextprotocol/sdk/types.js';

export type TToolRequest = z.infer<typeof CallToolRequestSchema>;

export type ToolRequest = (request: TToolRequest) => Promise<Result>;

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
