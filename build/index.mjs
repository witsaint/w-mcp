#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ListPromptsRequestSchema, GetPromptRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

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

const docPlanPromptSchema$1 = z.object({});
const docPlanPrompt$1 = async (request) => {
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
const docPlanPromptDesc$1 = `
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
packPrompt({
  description: docPlanPromptDesc$1,
  inputSchema: docPlanPromptSchema$1,
  handler: docPlanPrompt$1
});

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

const DOC_GEN_BEGIN_TOOL = "doc_gen_begin";
const docPlanPromptSchema = z.object({});
const docPlanPrompt = async (request) => {
  const planPrompt = `
You are an expert in document generation. Please analyze and generate documents based on the project. Keep doing this until the document is written.

Your thinking should be thorough, so it doesn't matter if it is long. However, avoid unnecessary repetition and verbosity. You should be concise, but comprehensive.

You must iterate until the document is perfect, complete, and usable. Generate documents associated with different projects

End your turn only when you are sure that the problem has been solved and everything has been checked. Check the problem step by step and make sure your changes are correct. Never end your turn until the problem is truly completely solved. When you say you want to call the tool, make sure you actually call the tool instead of ending your turn.

If the user request is "Resume", "Continue", or "Retry", check the previous conversation history to see the next unfinished step in the to-do list. Continue from that step until all to-do items are completed and all items are checked before returning control to the user. Tell the user that you will continue from the last unfinished step and what that step is.

You must continue to work until the problem is completely solved and all items in the to-do list are completed. Do not end your turn until you have completed all steps in the to-do list and confirmed that everything is OK.

You are a capable and autonomous agent, and you can definitely solve this problem without further input from the user.

# Workflow
1: Deeply understand the project, think critically about what needs to be done, and use sequential thinking to break the problem into manageable parts. Consider the following points:
- What type of project is the project
- Which roles can read it
- Analyze the project from shallow to deep
- Use or explain
- Dependencies, interactions, links, modules, interfaces, methods, etc.
2: Search for context and browse project code
3: Customize a clear and scalable plan
4: Determine the location of document generation in the project
5: Determine the document structure, menu, and document module split according to the project
6: According to the document menu, generate the document content of the corresponding menu one by one, and update the document content task of the supplementary menu to the plan
7: Comprehensively and repeatedly verify until the document content is complete and meets the requirements before it can be handed over to the user

For more information on each step, please refer to the detailed section below.

## 1 Deeply understand the project
You need to analyze the project and think deeply about how to give the corresponding document structure

## 2 Code library search
According to the project type
- Browse related files and directories.
- Search for key functions, classes or variables related to the problem.
- Read and understand relevant code snippets.

## 3 Make a plan
Use the tool \`doc_gen_polit\` to create tasks and task status that require reflection, execution, and reasoning during the process. After thinking, if you want to add new tasks, please update the plan, such as executing the corresponding document content of the writing menu.

## 4 Document generation location
- Add \`.doc\` configuration to the project \`.gitignore\` file
- Create a \`.doc\` folder and call the tool \`create_docs_template\` to perform initialization

## 5 Determine the document structure
Through project analysis, generate menus for document projects in \`.doc\`, with a maximum of two menus, use nextra as the document framework, and avoid using \`api\` as the folder name

## 6 Supplement document content
- Improve the task queue and update the task status according to the menu
- Supplement the document content corresponding to the menu one by one
- The content must be clear, reasonable and complete
- Only after the content of a document is completed will the document corresponding to the next menu be executed

## 7 Document completeness
- The menu content is complete and the module split is reasonable
- The corresponding document content is also complete

Requirements

- Fully analyze the project, identify the project type, and make the best module decomposition and corresponding document content module planning
- Document generation is unified according to the content format of markdown
- The document content needs to be detailed, accurate, and clear, and the visual chart based on \`mermaid\` can better show the relationship, using some flowcharts, UML, etc.
- Please display the parameters completely. Please explain the logic analysis reasonably.
- The document content structure is clear and easy to understand.
- Please bring the key code reference location, for example: it is displayed in the configuration part \`src/main/config/index.ts#23\`.
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
5. If detailed steps need to be added during the thinking process, update the unfinished steps in a timely manner, for example, refining the corresponding content of the document menu requires additional steps

When to use this prompt:
1. When you need to create a structured document plan
2. When you want to organize content into logical sections
3. When you need guidance on document structure and flow
4. When initializing or updating documentation templates

`;
const docGenBeginTool = packTool({
  description: docPlanPromptDesc,
  inputSchema: docPlanPromptSchema,
  handler: docPlanPrompt
});

const DOC_GEN_POLIT_TOOL = "doc_gen_polit";
const docGenPolitSchema = z.object({
  taskList: z.array(z.string()).min(1, "\u4EFB\u52A1\u62C6\u5206\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A"),
  // 任务拆分内容
  currentStep: z.number().min(0, "\u5F53\u524D\u6B65\u9AA4\u7D22\u5F15\u4E0D\u80FD\u4E3A\u7A7A"),
  // 当前任务步骤索引
  statusList: z.array(
    z.enum(["pending", "in_progress", "done", "skipped", "failed"])
  )
  // 每个任务的完成情况
});
const docGenPolit = async (request) => {
  const { taskList, currentStep, statusList } = docGenPolitSchema.parse(
    request.params.arguments
  );
  let nextStep = currentStep;
  let nextAction = "";
  const allDone = statusList.every((s) => s === "done");
  if (allDone) {
    nextAction = "\u6240\u6709\u4EFB\u52A1\u5DF2\u5B8C\u6210\uFF0C\u65E0\u9700\u540E\u7EED\u64CD\u4F5C\u3002";
    nextStep = -1;
  } else {
    const nextIdx = statusList.findIndex(
      (s, i) => s !== "done" && i > currentStep
    );
    if (nextIdx !== -1) {
      nextStep = nextIdx;
      nextAction = `\u8BF7\u7EE7\u7EED\u6267\u884C\u7B2C${nextStep + 1}\u6B65\uFF1A${taskList[nextStep]}`;
    } else {
      if (statusList[currentStep] !== "done") {
        nextAction = `\u8BF7\u5B8C\u6210\u5F53\u524D\u6B65\u9AA4\uFF1A${taskList[currentStep]}`;
      } else {
        const firstPending = statusList.findIndex((s) => s !== "done");
        if (firstPending !== -1) {
          nextStep = firstPending;
          nextAction = `\u8BF7\u5B8C\u6210\u7B2C${nextStep + 1}\u6B65\uFF1A${taskList[nextStep]}`;
        } else {
          nextAction = "\u4EFB\u52A1\u72B6\u6001\u5F02\u5E38\uFF0C\u8BF7\u68C0\u67E5\u8F93\u5165\u3002";
        }
      }
    }
  }
  return {
    content: [
      {
        type: "text",
        text: `\u4EFB\u52A1\u8FDB\u5EA6\u5206\u6790\uFF1A
- \u5F53\u524D\u6B65\u9AA4\uFF1A${currentStep + 1}\uFF08${taskList[currentStep] || "\u65E0"}\uFF09
- \u5F53\u524D\u72B6\u6001\uFF1A${statusList[currentStep]}
- \u4E0B\u4E00\u6B65\u5EFA\u8BAE\uFF1A${nextAction}`
      }
    ],
    nextStep,
    nextAction,
    allDone
  };
};
const docGenPolitTool = packTool({
  description: "\u5206\u6790\u6587\u6863\u751F\u6210\u4EFB\u52A1\u5B8C\u6210\u60C5\u51B5\u5E76\u7ED9\u51FA\u4E0B\u4E00\u6B65\u5EFA\u8BAE\u3002",
  inputSchema: docGenPolitSchema,
  handler: docGenPolit
});

const TEMPLATE_DIR = path.join(process.cwd(), "../templates/");
const CREATE_DOCS_TEMPLATE = "create_docs_template";
const createDocsTemplateSchema = z.object({
  targetPath: z.string().min(1, "Target path is required"),
  projectName: z.string().optional(),
  githubUrl: z.string().optional()
});
const createDocsTemplate = async (request) => {
  const {
    targetPath,
    projectName = "My Documentation",
    githubUrl
  } = createDocsTemplateSchema.parse(request.params.arguments);
  try {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    await copyTemplateFiles(TEMPLATE_DIR, targetPath);
    await customizeTemplate(targetPath, projectName, githubUrl);
    return {
      content: [
        {
          type: "text",
          text: TEMPLATE_DIR
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating documentation template: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
};
const createDocsTemplateTool = packTool({
  description: "Create a Nextra documentation site template at the specified location",
  inputSchema: z.object({
    targetPath: z.string().min(1, "Target path is required"),
    projectName: z.string().optional(),
    githubUrl: z.string().optional()
  }),
  handler: createDocsTemplate
});
async function copyTemplateFiles(sourceDir, targetDir) {
  const items = fs.readdirSync(sourceDir);
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);
    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      await copyTemplateFiles(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}
async function customizeTemplate(targetPath, projectName, githubUrl) {
  const themeConfigPath = path.join(targetPath, "theme.config.tsx");
  if (fs.existsSync(themeConfigPath)) {
    let themeConfig = fs.readFileSync(themeConfigPath, "utf-8");
    themeConfig = themeConfig.replace("My Documentation", projectName);
    if (githubUrl) {
      themeConfig = themeConfig.replace(
        "https://github.com/your-username/your-repo",
        githubUrl
      );
      themeConfig = themeConfig.replace(
        "https://github.com/your-username/your-repo/tree/main",
        `${githubUrl}/tree/main`
      );
    }
    fs.writeFileSync(themeConfigPath, themeConfig);
  }
  const packageJsonPath = path.join(targetPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packageJson.name = projectName.toLowerCase().replace(/\s+/g, "-");
    packageJson.description = `${projectName} documentation`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

function initTools(server) {
  registerTool(DOC_GEN_BEGIN_TOOL, docGenBeginTool);
  registerTool(DOC_GEN_POLIT_TOOL, docGenPolitTool);
  registerTool(CREATE_DOCS_TEMPLATE, createDocsTemplateTool);
  mountServerTool(server);
}

const server = createServerInstance();
initTools(server);
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
