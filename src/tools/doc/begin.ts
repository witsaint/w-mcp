import { z } from 'zod';
import { packTool } from '../../common/tools.js';
import type { TToolRequest } from '../../common/type.js';

// doc plan prompt

export const DOC_GEN_BEGIN_TOOL = 'doc_gen_begin';

const docPlanPromptSchema = z.object({});

export const docPlanPrompt = async (request: TToolRequest) => {
  // 这里可以添加 prompt 的具体逻辑
  // 例如：生成文档计划、分析内容结构等

  const planPrompt = `
    You are an expert in generating documents based on code analysis
<goal>
Based on the current project, conduct code analysis and generate a document that visually displays the results of the project analysis.
</goal>
<steps>
-The current project and directory need to add a .doc folder in .gitignore
-Identify the project and deeply consider the general structure of the project document, and provide a menu to the document based on the project type
-Analyze whether the documentation project based on Nextra in. doc has been initialized properly. If not initialized or needs updating, use the 'create_docs_template' tool to create/update a Nextra documentation template at the '.doc' directory with the latest version (Nextra 4.2.17, Next.js 15.3.2, React 18.2.0)
-Install dependencies and generate the corresponding code directory and files for Nextra based on the document menu structure
-Gradually add document content that identifies, analyzes, and organizes projects on the page according to the document menu
-When advancing to the next step, it is necessary to verify whether the previous step has been completed. The task list, current step, and completion status can be called using the tool 'doc_gen_polit'
</steps>
<available_tools>
- create_docs_template: Creates a complete Nextra documentation template with the latest versions (Nextra 4.2.17, Next.js 15.3.2, React 18.2.0). Use this tool when initializing documentation or when the existing documentation needs to be updated to the latest template structure.
- doc_gen_polit: Analyzes task completion status and provides next step recommendations
</available_tools>
<requirements>
1: It is necessary to identify the current project type in order to present different document contents. For example, for lodash, it is necessary to demonstrate the quick start, installation and usage, as well as specific descriptions of each method.
2: For the process, it is necessary to reflect, scrutinize, whether the process is reasonable, whether the content is consistent with the project code, and the content must be refined, without rough branches and broken leaves
3: The document structure menu has a maximum of two layers, but the content should be precise and appropriate enough. The structure should be based on the project type and considerations, such as using documents, getting started、 Architecture analysis, module analysis, link analysis
4: The steps should proceed according to my instructions. You can group tasks and then consider whether each task has been completed
5: Content presentation requires the use of some mermaid style icons such as flowcharts and UML diagrams, as well as indicating the source when generating document content. For example, according to<From><src/modules/a/task.ts # 34 \`</From>, the function of the \` sendMessage \` method is indicated ..
6: When creating or updating the documentation template, always use the 'create_docs_template' tool to ensure you get the latest Nextra version (4.2.17) with proper Next.js (15.3.2) and React (18.2.0) compatibility
7: Ultimately, it is necessary to verify whether the projects in .doc can run normally. And solve related problems
</requirement>
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

`;

export const docGenBeginTool = packTool({
  description: docPlanPromptDesc,
  inputSchema: docPlanPromptSchema,
  handler: docPlanPrompt,
});
