import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  addAccount,
  GIT_ACCOUNT,
  LIST_GIT_ACCOUNT,
  listGitAccountHandler,
} from './git/account.js';

const gitAccountInputSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});
const emptyInputSchema = z.object({});

export function initTools(server: McpServer) {
  server.registerTool<typeof gitAccountInputSchema.shape, any>(
    GIT_ACCOUNT,
    {
      title: '添加 git 账号',
      description:
        'Add git account, eg: { "username": "your_username", "email": "your_email" }',
      inputSchema: gitAccountInputSchema.shape,
    },
    async (args) => {
      const result = await addAccount(args);
      return {
        content: [{ type: 'text', text: `Tool echo: ${JSON.stringify(args)}` }],
      };
    }
  );

  server.registerTool(
    LIST_GIT_ACCOUNT,
    {
      title: '列出所有 git 账号',
      description: 'List all git accounts',
      inputSchema: emptyInputSchema.shape,
    },
    async () => {
      const accounts = await listGitAccountHandler();
      return {
        content: accounts.map((account) => ({
          type: 'text',
          text: `Username: ${account.username}, Email: ${account.email}`,
        })),
      };
    }
  );
}
