#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ListPromptsRequestSchema, GetPromptRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
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

const prompts = /* @__PURE__ */ new Map();
function registerPrompt(name, prompt) {
  if (prompts.has(name)) {
    throw new Error(`Prompt ${name} already registered`);
  }
  prompts.set(name, prompt);
}
async function listPrompts() {
  const promptConfig = Array.from(prompts.keys()).map((name) => {
    const { description, schema } = prompts.get(name);
    return {
      name,
      description,
      inputSchema: schema
    };
  });
  return { prompts: promptConfig };
}
async function resolvePrompt(request) {
  const { name } = request.params;
  if (!prompts.has(name)) {
    throw new Error(`Prompt ${name} not found`);
  }
  const { handler } = prompts.get(name);
  return await handler(request);
}
function mountServerPrompt(server) {
  server.setRequestHandler(ListPromptsRequestSchema, listPrompts);
  server.setRequestHandler(GetPromptRequestSchema, resolvePrompt);
}
function packPrompt(config) {
  const { description, inputSchema, handler } = config;
  const prompt = {
    description,
    schema: zodToJsonSchema(inputSchema),
    handler
  };
  return prompt;
}

const resources = /* @__PURE__ */ new Map();
function registerResource(name, resource) {
  if (resources.has(name)) {
    throw new Error(`Resource ${name} already registered`);
  }
  resources.set(name, resource);
}
async function listResources() {
  const resourceConfig = Array.from(resources.keys()).map((name) => {
    const { description, schema } = resources.get(name);
    return {
      name,
      description,
      inputSchema: schema
    };
  });
  return { resources: resourceConfig };
}
async function resolveResource(request) {
  const { uri } = request.params;
  if (!resources.has(uri)) {
    throw new Error(`Resource ${uri} not found`);
  }
  const { handler } = resources.get(uri);
  return await handler(request);
}
function mountServerResource(server) {
  server.setRequestHandler(ListResourcesRequestSchema, listResources);
  server.setRequestHandler(ReadResourceRequestSchema, resolveResource);
}
function packResource(config) {
  const { description, inputSchema, handler } = config;
  const resource = {
    description,
    schema: zodToJsonSchema(inputSchema),
    handler
  };
  return resource;
}

const docPlanPromptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required")
});
const docPlanPrompt = async (request) => {
  const planPrompt = `
    You are an expert in generating documents based on code analysis
<goal>
Based on the current project, conduct code analysis and generate a document that visually displays the results of the project analysis.
</goal>
<steps>
-The current project and directory need to add a. doc folder in. gitignore
-Identify the project and deeply consider the general structure of the project document, and provide a menu to the document based on the project type
-Analyze whether the documentation project based on Nextra in. doc has been initialized properly, including installing dependencies and generating the corresponding code directory and files for Nextra based on the document menu structure
-Gradually add document content that identifies, analyzes, and organizes projects on the page according to the document menu
-When advancing to the next step, it is necessary to verify whether the previous step has been completed. The task list, current step, and completion status can be called using the tool 'doc_gen_polit'
</steps>
<requirements>
1: It is necessary to identify the current project type in order to present different document contents. For example, for loadsh, it is necessary to demonstrate the quick start, installation and usage, as well as specific descriptions of each method.
2: For the process, it is necessary to reflect, scrutinize, whether the process is reasonable, whether the content is consistent with the project code, and the content must be refined, without rough branches and broken leaves
3: The document structure menu has a maximum of two layers, but the content should be precise and appropriate enough. The structure should be based on the project type and considerations, such as using documents, getting started API\u3001 Architecture analysis, module analysis, link analysis
4: The steps should proceed according to my instructions. You can group tasks and then consider whether each task has been completed
5: Content presentation requires the use of some mermaid style icons such as flowcharts and UML diagrams, as well as indicating the source when generating document content. For example, according to<From><src/modules/a/task. ts # 34 \`</From>, the function of the \` sendMessage \` method is indicated ..
6: Ultimately, it is necessary to verify whether the projects in. doc can run normally. And solve related problems
</requirement>
  `;
  return {
    content: [
      {
        type: "text",
        text: planPrompt
      }
    ]
  };
};
const docPlanPromptDesc = `
    A prompt for generating document plans based on the provided title and content.
This prompt has the ability to:
1. Analyze the provided content and generate structured document plans
2. Suggest document sections and organization
3. Provide recommendations for content improvement
4. Generate outlines and summaries

When to use this prompt:
1. When you need to create a structured document plan
2. When you want to organize content into logical sections
3. When you need guidance on document structure and flow
`;
const docPlanPromptInstance = packPrompt({
  description: docPlanPromptDesc,
  inputSchema: docPlanPromptSchema,
  handler: docPlanPrompt
});

function registerAllPrompts() {
  registerPrompt("doc_plan_prompt", docPlanPromptInstance);
}

const notesResourceSchema = z.object({
  uri: z.string().min(1, "URI is required")
});
const notesResource = async (request) => {
  const { uri } = notesResourceSchema.parse(request.params);
  return {
    contents: [
      {
        uri,
        mimeType: "text/plain",
        text: `Content for resource: ${uri}`
      }
    ]
  };
};
const notesResourceDesc = `
    A resource for reading notes and documents.
This resource has the ability to:
1. Read note files from the filesystem
2. Retrieve document content from various sources
3. Provide formatted text content
4. Support different MIME types

When to use this resource:
1. When you need to read note files
2. When you want to access document content
3. When you need to retrieve formatted text
4. When you want to access file-based resources
`;
const notesResourceInstance = packResource({
  description: notesResourceDesc,
  inputSchema: notesResourceSchema,
  handler: notesResource
});

function registerAllResources() {
  registerResource("notes", notesResourceInstance);
}

const tools = /* @__PURE__ */ new Map();
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

function initTools(server) {
  mountServerTool(server);
}

const server = createServerInstance();
initTools(server);
registerAllPrompts();
mountServerPrompt(server);
registerAllResources();
mountServerResource(server);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
