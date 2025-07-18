import { z } from 'zod';
import { createServerInstance } from '../../common/context.js';
import { packPrompt } from '../../common/prompt.js';
import type { TPromptRequest } from '../../common/type.js';

// doc plan prompt

export const DOC_PLAN_PROMPT = 'doc_plan_prompt';

const docPlanPromptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export const docPlanPrompt = async (request: TPromptRequest) => {
  const { title, content } = docPlanPromptSchema.parse(
    request.params.arguments
  );

  // 这里可以添加 prompt 的具体逻辑
  // 例如：生成文档计划、分析内容结构等

  return {
    content: [
      {
        type: 'text',
        text: `Generated document plan for "${title}":\n\n${content}`,
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
