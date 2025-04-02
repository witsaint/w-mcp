import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { mountServerTool } from '../common/tools.js';

export function initTools(server: Server) {
  mountServerTool(server);
}
