import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { mountServerTool, registerTool } from '../common/tools.js';
import { DOC_GEN_BEGIN_TOOL, docGenBeginTool } from './doc/begin.js';
import { DOC_GEN_POLIT_TOOL, docGenPolitTool } from './doc/polit.js';

export function initTools(server: Server) {
  registerTool(DOC_GEN_BEGIN_TOOL, docGenBeginTool);
  registerTool(DOC_GEN_POLIT_TOOL, docGenPolitTool);
  mountServerTool(server);
}
