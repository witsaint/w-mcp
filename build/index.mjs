#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

let serverContext = void 0;
const setServerContext = (server) => {
  serverContext = server;
};
const createServerInstance = () => {
  if (serverContext) return serverContext;
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
  setServerContext(server);
  return server;
};

const tools = /* @__PURE__ */ new Map();
function registerTool(name, tool) {
  if (tools.has(name)) {
    throw new Error(`Tool ${name} already registered`);
  }
  tools.set(name, tool);
}
async function listTools() {
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

const DOC_PLAN = "doc_plan";
const docPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required")
});
const docPlan = async (request) => {
  const { title, content } = docPlanSchema.parse(request.params.arguments);
  const server = createServerInstance();
  const response = await server.createMessage({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please summarize the following text concisely:

${content}`
        }
      }
    ],
    maxTokens: 500
  });
  return {
    content: [
      {
        type: "text",
        text: response.content.type === "text" ? response.content.text : "Unable to generate summary"
      }
    ]
  };
};
const docPlanTool = packTool({
  description: "\u751F\u6210\u6587\u6863\u8BA1\u5212, Generate doc plan",
  inputSchema: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required")
  }),
  handler: docPlan
});

function initTools(server) {
  registerTool(DOC_PLAN, docPlanTool);
  mountServerTool(server);
}

const server = createServerInstance();
initTools(server);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
