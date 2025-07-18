# MCP Prompt 抽象逻辑

这个模块提供了类似于 `tools.ts` 的 MCP prompt 抽象逻辑，用于管理和处理 prompt 请求。

## 核心功能

### 1. Prompt 注册 (`registerPrompt`)

```typescript
import { registerPrompt } from './common/prompt.js';

registerPrompt('my_prompt', promptInstance);
```

### 2. Prompt 列表 (`listPrompts`)

返回所有已注册的 prompts 列表，包含名称、描述和输入模式。

### 3. Prompt 解析 (`resolvePrompt`)

处理 prompt 请求，调用相应的 handler 函数。

### 4. 服务器挂载 (`mountServerPrompt`)

将 prompt 处理函数挂载到 MCP 服务器上。

### 5. Prompt 打包 (`packPrompt`)

将 prompt 配置转换为标准的 prompt 实例。

## 使用示例

### 创建 Prompt 实例

```typescript
import { z } from 'zod';
import { packPrompt } from './common/prompt.js';

const myPromptSchema = z.object({
  input: z.string().min(1),
  options: z
    .object({
      maxLength: z.number().optional(),
    })
    .optional(),
});

const myPromptHandler = async (request: TPromptRequest) => {
  const { input, options } = myPromptSchema.parse(request.params.arguments);

  // 处理 prompt 逻辑
  const result = await processPrompt(input, options);

  return {
    content: [
      {
        type: 'text',
        text: result,
      },
    ],
  };
};

const myPromptInstance = packPrompt({
  description: 'A prompt for processing text input',
  inputSchema: myPromptSchema,
  handler: myPromptHandler,
});
```

### 注册和挂载

```typescript
import { registerPrompt, mountServerPrompt } from './common/prompt.js';

// 注册 prompt
registerPrompt('my_prompt', myPromptInstance);

// 挂载到服务器
mountServerPrompt(server);
```

## 类型定义

### IPromptConfig

```typescript
interface IPromptConfig {
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  handler: PromptRequest;
}
```

### IPrompt

```typescript
interface IPrompt {
  description: string;
  schema: Result;
  handler: PromptRequest;
}
```

### TPromptRequest

```typescript
type TPromptRequest = z.infer<typeof GetPromptRequestSchema>;
```

## 与 Tools 的对比

| 功能 | Tools             | Prompts             |
| ---- | ----------------- | ------------------- |
| 注册 | `registerTool`    | `registerPrompt`    |
| 列表 | `listTools`       | `listPrompts`       |
| 解析 | `resolveTool`     | `resolvePrompt`     |
| 挂载 | `mountServerTool` | `mountServerPrompt` |
| 打包 | `packTool`        | `packPrompt`        |

## 最佳实践

1. **Schema 定义**: 使用 Zod 定义严格的输入模式
2. **错误处理**: 在 handler 中妥善处理错误情况
3. **类型安全**: 确保所有类型定义正确
4. **文档化**: 为每个 prompt 提供清晰的描述
5. **测试**: 为 prompt 逻辑编写单元测试
