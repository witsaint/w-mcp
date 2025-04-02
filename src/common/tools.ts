import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Result,
} from '@modelcontextprotocol/sdk/types.js';
import type { ITool, TRequest } from '../common/type.js';

const tools = new Map<string, ITool<Result>>();

export function registerTool(name: string, tool: ITool<Result>) {
  if (tools.has(name)) {
    throw new Error(`Tool ${name} already registered`);
  }
  tools.set(name, tool);
}

export function listTools() {
  return {};
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
