import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { mountServerTool, registerTool } from '../common/tools.js';
import {
  CHECKOUT_GIT_ACCOUNT,
  checkoutGitAccountTool,
  GIT_ACCOUNT,
  gitAccountTool,
  LIST_GIT_ACCOUNT,
  listGitAccountTool,
} from './git/account.js';

export function initTools(server: Server) {
  registerTool(GIT_ACCOUNT, gitAccountTool);
  registerTool(LIST_GIT_ACCOUNT, listGitAccountTool);
  registerTool(CHECKOUT_GIT_ACCOUNT, checkoutGitAccountTool);
  mountServerTool(server);
}
