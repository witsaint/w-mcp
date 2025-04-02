import { zodToJsonSchema } from 'zod-to-json-schema';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Result,
} from '@modelcontextprotocol/sdk/types.js';
import type { ITool, IToolConfig, TRequest } from '../common/type.js';

const tools = new Map<string, ITool>();

export function registerTool(name: string, tool: ITool) {
  if (tools.has(name)) {
    throw new Error(`Tool ${name} already registered`);
  }
  tools.set(name, tool);
}

export async function listTools() {
  console.log('listTools', tools);
  const toolConfig = Array.from(tools.keys()).map((name) => {
    const { description, schema } = tools.get(name)!;
    return {
      name,
      description,
      inputSchema: schema,
    };
  });
  return { tools: toolConfig };
}

/**
 * This function resolves a tool request.
 * It currently does not perform any specific action and returns an empty object.
 *
 * @param request - The tool request to resolve.
 * @returns An empty object.
 */

export async function resolveTool(request: TRequest) {
  const { name } = request.params;

  if (!tools.has(name)) {
    throw new Error(`Tool ${name} not found`);
  }

  const { handler } = tools.get(name)!;

  return await handler!(request);
}

export function mountServerTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, listTools);
  server.setRequestHandler(CallToolRequestSchema, resolveTool);
}

export function packTool(config: IToolConfig): ITool {
  const { description, inputSchema, handler } = config;
  const tool: ITool = {
    description,
    schema: zodToJsonSchema(inputSchema),
    handler,
  };
  return tool;
}
