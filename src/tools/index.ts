import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { mountServerTool, registerTool } from '../common/tools.js';
import { DOC_PLAN, docPlanTool } from './doc/plan.js';

export function initTools(server: Server) {
  registerTool(DOC_PLAN, docPlanTool);
  mountServerTool(server);
}
