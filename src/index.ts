#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServerInstance } from './common/context.js';
import { mountServerPrompt } from './common/prompt.js';
import { mountServerResource } from './common/resources.js';
import { registerAllPrompts } from './prompts/index.js';
import { registerAllResources } from './resources/index.js';
import { initTools } from './tools/index.js';

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
const server = createServerInstance();

initTools(server);

// Initialize and mount prompts
registerAllPrompts();
mountServerPrompt(server);

// Initialize and mount resources
registerAllResources();
mountServerResource(server);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
