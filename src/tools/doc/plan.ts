import { z } from 'zod';
import { createServerInstance } from '../../common/context.js';
import { packTool } from '../../common/tools.js';
import type { TToolRequest } from '../../common/type.js';

// doc plan

export const DOC_PLAN = 'doc_plan';

const docPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export const docPlan = async (request: TToolRequest) => {
  const { title, content } = docPlanSchema.parse(request.params.arguments);
  const server = createServerInstance();
  const response = await server.createMessage({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please summarize the following text concisely:\n\n${content}`,
        },
      },
    ],
    maxTokens: 500,
  });

  return {
    content: [
      {
        type: 'text',
        text:
          response.content.type === 'text'
            ? response.content.text
            : 'Unable to generate summary',
      },
    ],
  };
};

const docPlanDesc = `
    A tool for generating document plans based on the current project plan.
This tool has the ability to plan steps, propose plans, and requirements.
When to use this tool:
1: The user wants to generate a project introduction and usage document based on the current project
2: Generate analysis documents based on project code, able to quickly explain content
3: Analyze the modules, architecture, and relationships of the code
`;

export const docPlanTool = packTool({
  description: docPlanDesc,
  inputSchema: z.object({}),
  handler: docPlan,
});
