#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const tools = /* @__PURE__ */ new Map();
function registerTool(name, tool) {
  if (tools.has(name)) {
    throw new Error(`Tool ${name} already registered`);
  }
  tools.set(name, tool);
}
async function listTools() {
  console.log("listTools", tools);
  const toolConfig = Array.from(tools.keys()).map((name) => {
    const { description, schema } = tools.get(name);
    return {
      name,
      description,
      inputSchema: schema
    };
  });
  return { tools: toolConfig };
}
async function resolveTool(request) {
  const { name } = request.params;
  if (!tools.has(name)) {
    throw new Error(`Tool ${name} not found`);
  }
  const { handler } = tools.get(name);
  return await handler(request);
}
function mountServerTool(server) {
  server.setRequestHandler(ListToolsRequestSchema, listTools);
  server.setRequestHandler(CallToolRequestSchema, resolveTool);
}
function packTool(config) {
  const { description, inputSchema, handler } = config;
  const tool = {
    description,
    schema: zodToJsonSchema(inputSchema),
    handler
  };
  return tool;
}

const accounts = [];
const GIT_ACCOUNT = "git_add_account";
const LIST_GIT_ACCOUNT = "git_list_account";
const CHECKOUT_GIT_ACCOUNT = "git_checkout_account";
const accountSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address")
});
const checkAccountSchema = accountSchema.pick({
  username: true
});
async function addAccount(request) {
  const { username, email } = accountSchema.parse(request.params.arguments);
  accounts.push({ username, email });
  return {
    content: [
      {
        type: "text",
        text: `Added git account: ${username}, email: ${email}`
      }
    ]
  };
}
async function listAllGitAccount(params) {
  return {
    content: accounts.map((account) => ({
      type: "text",
      text: `Username: ${account.username}, Email: ${account.email}`
    }))
  };
}
async function checkoutGitAccount(request) {
  const { username } = checkAccountSchema.parse(request.params.arguments);
  const account = accounts.find((acc) => acc.username === username);
  if (!account) {
    throw new Error(`Account with username ${username} not found`);
  }
  return {
    content: [
      {
        type: "text",
        text: `\u8BF7\u6267\u884C\u547D\u4EE4: git config --global user.name "${account.username}" && git config --global user.email "${account.email}"`
      }
    ]
  };
}
const gitAccountTool = packTool({
  description: '\u6DFB\u52A0 git \u8D26\u53F7, Add git account, eg: { "username": "your_username", "email": "your_email" }',
  inputSchema: accountSchema,
  handler: addAccount
});
const listGitAccountTool = packTool({
  description: "\u5217\u51FA\u6240\u6709 git \u8D26\u53F7, List all git accounts",
  inputSchema: z.object({}),
  handler: listAllGitAccount
});
const checkoutGitAccountTool = packTool({
  description: "\u5207\u6362 git \u8D26\u53F7, Switch git account",
  inputSchema: z.object({
    username: z.string().min(1, "Username is required")
  }),
  handler: checkoutGitAccount
});

function initTools(server) {
  registerTool(GIT_ACCOUNT, gitAccountTool);
  registerTool(LIST_GIT_ACCOUNT, listGitAccountTool);
  registerTool(CHECKOUT_GIT_ACCOUNT, checkoutGitAccountTool);
  mountServerTool(server);
}

const server = new Server(
  {
    name: "tcfe",
    version: "0.1.0"
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {}
    }
  }
);
initTools(server);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
