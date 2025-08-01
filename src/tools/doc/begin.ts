import { z } from 'zod';
import { packTool } from '../../common/tools.js';
import type { TToolRequest } from '../../common/type.js';

// doc plan prompt

export const DOC_GEN_BEGIN_TOOL = 'doc_gen_begin';

const docPlanPromptSchema = z.object({
  projectPath: z.string().min(1, 'Project path is required'),
});

export const docPlanPrompt = async (request: TToolRequest) => {
  const { projectPath } = docPlanPromptSchema.parse(request.params.arguments);

  // 这里可以添加 prompt 的具体逻辑
  // 例如：生成文档计划、分析内容结构等

  const planPrompt = `
You are an expert in document generation. Please analyze and generate documents based on the project. Keep doing this until the document is written.

Your thinking should be thorough, so it doesn't matter if it is long. However, avoid unnecessary repetition and verbosity. comprehensive.

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
- Including but not limited to dependencies, interactions, links, modules, interfaces, methods, and how the parts you can analyze are presented in series
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
- The lasted nextra rule：
  - The first level menu config in \`_meta.global.tsx\` file
  - The next level menu config in \`_meta.ts\` file
  - The page content is in the name of \`page.tsx\` file in the menu folder
  - The Cotent use Markdown format
  eg: path is \`/android/install\`
  \`\`\`tsx file: \`/app/_meta.ts\`
    construct of project:
    -src
      -app
        -android
          -install
            -page.mdx
          -_meta.ts
        -_meta.global.tsx
    -public
    -nextra.config.ts
  \`\`\`tsx file: \`/app/_meta.global.tsx\`
  import type { MetaRecord } from 'nextra';

  const mate: MetaRecord = {
    android: {
      type: 'page',
      title: 'android Page',
    },
  };
  export default mate;
  \`\`\`

  \`\`\`tsx file: \`/app/android/_meta.ts\`
    import type { MetaRecord } from 'nextra';
    const meta: MetaRecord = {
      android: 'android',
    };
    export default meta;
  \`\`\`

## 6 Supplement document content
- Improve the task queue and update the task status according to the menu
- Supplement the document content corresponding to the menu one by one
- The content must be clear, reasonable and complete
- Only after the content of a document is completed will the document corresponding to the next menu be executed
- We need to think dialectically about the content of each chapter.
  - Who is the user?
  - What granularity of content do you need to know?
  - What chart format is best for presentation?
  - Can the current content be broken down into specific goals?
  - Can you reference key code locations?
## 7 Document completeness
- Determine the current environment using a package manager, such as \`pnpm\`, \`npm\`, \`yarn\`, etc.
- The Doc project path is \`${projectPath}\`
- The menu content is complete and the module split is reasonable
- The corresponding document content is also complete

Requirements

- Fully analyze the project, identify the project type, and make the best module decomposition and corresponding document content module planning
- Document generation is unified according to the content format of markdown
- The document content needs to be detailed, precise, and clear. The visual diagrams based on \`mermaid\` can better show the associations. Use some flowcharts, UML, etc. If necessary, add text descriptions below the diagrams and mark the source of the code, for example: in the configuration part \`src/main/config/index.ts#23\` is displayed.- Please display the parameters completely. Please explain the logic analysis reasonably.
- The document content structure is clear and easy to understand.
- Please bring the key code reference location, for example: it is displayed in the configuration part \`src/main/config/index.ts#23\`.
  `;

  return {
    content: [
      {
        type: 'text',
        text: planPrompt,
      },
    ],
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
5. When you need to generate document content or document site
6. Begin to generate document content or document site

`;

export const docGenBeginTool = packTool({
  description: docPlanPromptDesc,
  inputSchema: docPlanPromptSchema,
  handler: docPlanPrompt,
});
