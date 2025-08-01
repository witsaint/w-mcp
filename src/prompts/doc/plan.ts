import { z } from 'zod';
import { createServerInstance } from '../../common/context.js';
import { packPrompt } from '../../common/prompt.js';
import type { TPromptRequest } from '../../common/type.js';

// doc plan prompt

export const DOC_PLAN_PROMPT = 'doc_plan_prompt';

const docPlanPromptSchema = z.object({});

export const docPlanPrompt = async (request: TPromptRequest) => {
  // 这里可以添加 prompt 的具体逻辑
  // 例如：生成文档计划、分析内容结构等

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
3: The document structure menu has a maximum of two layers, but the content should be precise and appropriate enough. The structure should be based on the project type and considerations, such as using documents, getting started API、 Architecture analysis, module analysis, link analysis
4: The steps should proceed according to my instructions. You can group tasks and then consider whether each task has been completed
5: Content presentation requires the use of some mermaid style icons such as flowcharts and UML diagrams, as well as indicating the source when generating document content. For example, according to<From><src/modules/a/task. ts # 34 \`</From>, the function of the \` sendMessage \` method is indicated ..
6: Ultimately, it is necessary to verify whether the projects in. doc can run normally. And solve related problems
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

When to use this prompt:
1. When you need to create a structured document plan
2. When you want to organize content into logical sections
3. When you need guidance on document structure and flow
`;

export const docPlanPromptInstance = packPrompt({
  description: docPlanPromptDesc,
  inputSchema: docPlanPromptSchema,
  handler: docPlanPrompt,
});
