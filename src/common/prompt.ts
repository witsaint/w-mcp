import { zodToJsonSchema } from 'zod-to-json-schema';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { IPrompt, IPromptConfig, TPromptRequest } from './type.js';

const prompts = new Map<string, IPrompt>();

export function registerPrompt(name: string, prompt: IPrompt) {
  if (prompts.has(name)) {
    throw new Error(`Prompt ${name} already registered`);
  }
  prompts.set(name, prompt);
}

export async function listPrompts() {
  const promptConfig = Array.from(prompts.keys()).map((name) => {
    const { description, schema } = prompts.get(name)!;
    return {
      name,
      description,
      inputSchema: schema,
    };
  });
  return { prompts: promptConfig };
}

/**
 * This function resolves a prompt request.
 * It currently does not perform any specific action and returns an empty object.
 *
 * @param request - The prompt request to resolve.
 * @returns An empty object.
 */
export async function resolvePrompt(request: TPromptRequest) {
  const { name } = request.params;

  if (!prompts.has(name)) {
    throw new Error(`Prompt ${name} not found`);
  }

  const { handler } = prompts.get(name)!;

  return await handler!(request);
}

export function mountServerPrompt(server: Server) {
  server.setRequestHandler(ListPromptsRequestSchema, listPrompts);
  server.setRequestHandler(GetPromptRequestSchema, resolvePrompt);
}

export function packPrompt(config: IPromptConfig): IPrompt {
  const { description, inputSchema, handler } = config;
  const prompt: IPrompt = {
    description,
    schema: zodToJsonSchema(inputSchema),
    handler,
  };
  return prompt;
}
