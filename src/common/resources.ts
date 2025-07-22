import { zodToJsonSchema } from 'zod-to-json-schema';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { IResource, IResourceConfig, TResourceRequest } from './type.js';

const resources = new Map<string, IResource>();

export function registerResource(name: string, resource: IResource) {
  if (resources.has(name)) {
    throw new Error(`Resource ${name} already registered`);
  }
  resources.set(name, resource);
}

export async function listResources() {
  const resourceConfig = Array.from(resources.keys()).map((name) => {
    const { description, schema } = resources.get(name)!;
    return {
      name,
      description,
      inputSchema: schema,
    };
  });
  return { resources: resourceConfig };
}

/**
 * This function resolves a resource request.
 * It currently does not perform any specific action and returns an empty object.
 *
 * @param request - The resource request to resolve.
 * @returns An empty object.
 */
export async function resolveResource(request: TResourceRequest) {
  const { uri } = request.params;

  if (!resources.has(uri)) {
    throw new Error(`Resource ${uri} not found`);
  }

  const { handler } = resources.get(uri)!;

  return await handler!(request);
}

export function mountServerResource(server: Server) {
  server.setRequestHandler(ListResourcesRequestSchema, listResources);
  server.setRequestHandler(ReadResourceRequestSchema, resolveResource);
}

export function packResource(config: IResourceConfig): IResource {
  const { description, inputSchema, handler } = config;
  const resource: IResource = {
    description,
    schema: zodToJsonSchema(inputSchema),
    handler,
  };
  return resource;
}
