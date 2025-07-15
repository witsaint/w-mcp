import { z } from 'zod';

export const GIT_ACCOUNT = 'git_add_account';
export const LIST_GIT_ACCOUNT = 'git_list_account';
export const CHECKOUT_GIT_ACCOUNT = 'git_checkout_account';

export const gitAccountSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});
export const checkoutGitAccountSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

const accounts: { username: string; email: string }[] = [];

export async function addAccount({
  username,
  email,
}: {
  username: string;
  email: string;
}) {
  accounts.push({ username, email });
}

export async function listGitAccountHandler() {
  return accounts;
}

export async function checkoutGitAccountHandler({
  username,
}: {
  username: string;
}) {
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
