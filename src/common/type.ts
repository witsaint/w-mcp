import type { z, ZodLiteral, ZodObject } from 'zod';
import type {
  CallToolRequestSchema,
  Result,
} from '@modelcontextprotocol/sdk/types.js';

export type TRequest = z.infer<typeof CallToolRequestSchema>;

export type ToolRequest = (request: TRequest) => Promise<Result>;

export interface ITool<SendResultT extends Result> {
  description: string;
  schema: SendResultT;
  handler: ToolRequest;
}
