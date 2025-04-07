import { z } from 'zod';
import { packTool } from '../../common/tools.js';
import type { TToolRequest } from '../../common/type.js';

const accounts = [] as { username: string; email: string }[];

export const GIT_ACCOUNT = 'git_add_account';
export const LIST_GIT_ACCOUNT = 'git_list_account';
export const CHECKOUT_GIT_ACCOUNT = 'git_checkout_account';

const accountSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

const checkAccountSchema = accountSchema.pick({
  username: true,
});

async function addAccount(request: TToolRequest) {
  const { username, email } = accountSchema.parse(request.params.arguments);
  accounts.push({ username, email });
  return {
    content: [
      {
        type: 'text',
        text: `Added git account: ${username}, email: ${email}`,
      },
    ],
  };
}

async function listAllGitAccount(params: TToolRequest) {
  return {
    content: accounts.map((account) => ({
      type: 'text',
      text: `Username: ${account.username}, Email: ${account.email}`,
    })),
  };
}

async function checkoutGitAccount(request: TToolRequest) {
  const { username } = checkAccountSchema.parse(request.params.arguments);
  const account = accounts.find((acc) => acc.username === username);

  if (!account) {
    throw new Error(`Account with username ${username} not found`);
  }
  return {
    content: [
      {
        type: 'text',
        text: `请执行命令: git config --global user.name "${account.username}" && git config --global user.email "${account.email}"`,
      },
    ],
  };
}

export const gitAccountTool = packTool({
  description:
    '添加 git 账号, Add git account, eg: { "username": "your_username", "email": "your_email" }',
  inputSchema: accountSchema,
  handler: addAccount,
});

export const listGitAccountTool = packTool({
  description: '列出所有 git 账号, List all git accounts',
  inputSchema: z.object({}),
  handler: listAllGitAccount,
});

export const checkoutGitAccountTool = packTool({
  description: '切换 git 账号, Switch git account',
  inputSchema: z.object({
    username: z.string().min(1, 'Username is required'),
  }),
  handler: checkoutGitAccount,
});
