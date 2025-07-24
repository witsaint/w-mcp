import { z } from 'zod';
import { createServerInstance } from '../../common/context.js';
import { packTool } from '../../common/tools.js';
import type { TToolRequest } from '../../common/type.js';

// doc plan

export const DEMO = 'demo';

const docPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export const demo = async (request: TToolRequest) => {
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

export const demoTool = packTool({
  description: '生成文档计划, Generate doc plan',
  inputSchema: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
  }),
  handler: demo,
});

export * from './polit.js';
