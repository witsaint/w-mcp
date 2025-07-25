import { z } from 'zod';
import { packTool } from '../../common/tools.js';
import type { TToolRequest } from '../../common/type.js';

// polit tool: 分析任务完成情况并给出下一步建议

export const DOC_GEN_POLIT_TOOL = 'doc_gen_polit';

const docGenPolitSchema = z.object({
  taskList: z.array(z.string()).min(1, '任务拆分内容不能为空'), // 任务拆分内容
  currentStep: z.number().min(0, '当前步骤索引不能为空'), // 当前任务步骤索引
  statusList: z.array(
    z.enum(['pending', 'in_progress', 'done', 'skipped', 'failed'])
  ), // 每个任务的完成情况
});

export const docGenPolit = async (request: TToolRequest) => {
  const { taskList, currentStep, statusList } = docGenPolitSchema.parse(
    request.params.arguments
  );

  // 分析当前任务完成情况，给出下一步建议
  let nextStep = currentStep;
  let nextAction = '';
  const allDone = statusList.every((s) => s === 'done');

  if (allDone) {
    nextAction = '所有任务已完成，无需后续操作。';
    nextStep = -1;
  } else {
    // 找到下一个未完成的任务
    const nextIdx = statusList.findIndex(
      (s, i) => s !== 'done' && i > currentStep
    );
    if (nextIdx !== -1) {
      nextStep = nextIdx;
      nextAction = `请继续执行第${nextStep + 1}步：${taskList[nextStep]}`;

      // 如果下一步涉及文档模板创建，提供额外指导
      if (
        taskList[nextStep].includes('Nextra') ||
        taskList[nextStep].includes('文档模板') ||
        taskList[nextStep].includes('初始化')
      ) {
        nextAction += `\n\n💡 提示：如需创建或更新Nextra文档模板，请使用 'create_docs_template' 工具，它包含最新版本：
- Nextra 4.2.17
- Next.js 15.3.2  
- React 18.2.0
参数：targetPath（必填），projectName（可选），githubUrl（可选）`;
      }
    } else {
      // 如果当前步骤未完成，提示继续当前步骤
      if (statusList[currentStep] !== 'done') {
        nextAction = `请完成当前步骤：${taskList[currentStep]}`;

        // 同样为当前步骤提供模板工具提示
        if (
          taskList[currentStep].includes('Nextra') ||
          taskList[currentStep].includes('文档模板') ||
          taskList[currentStep].includes('初始化')
        ) {
          nextAction += `\n\n💡 提示：如需创建或更新Nextra文档模板，请使用 'create_docs_template' 工具`;
        }
      } else {
        // 否则回到第一个未完成的任务
        const firstPending = statusList.findIndex((s) => s !== 'done');
        if (firstPending !== -1) {
          nextStep = firstPending;
          nextAction = `请完成第${nextStep + 1}步：${taskList[nextStep]}`;
        } else {
          nextAction = '任务状态异常，请检查输入。';
        }
      }
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `任务进度分析：\n- 当前步骤：${currentStep + 1}（${taskList[currentStep] || '无'}）\n- 当前状态：${statusList[currentStep]}\n- 下一步建议：${nextAction}`,
      },
    ],
    nextStep,
    nextAction,
    allDone,
  };
};

export const docGenPolitTool = packTool({
  description:
    '分析任务完成情况并给出下一步建议。当任务涉及Nextra文档模板时，会自动提示使用create_docs_template工具创建最新版本模板',
  inputSchema: docGenPolitSchema,
  handler: docGenPolit,
});
