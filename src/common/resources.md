# MCP Resources 抽象逻辑

这个模块提供了类似于 `tools.ts` 和 `prompt.ts` 的 MCP resources 抽象逻辑，用于管理和处理 resource 请求。

## 核心功能

### 1. Resource 注册 (`registerResource`)

```typescript
import { registerResource } from './common/resources.js';

registerResource('my_resource', resourceInstance);
```

### 2. Resource 列表 (`listResources`)

返回所有已注册的 resources 列表，包含名称、描述和输入模式。

### 3. Resource 解析 (`resolveResource`)

处理 resource 请求，调用相应的 handler 函数。

### 4. 服务器挂载 (`mountServerResource`)

将 resource 处理函数挂载到 MCP 服务器上。

### 5. Resource 打包 (`packResource`)

将 resource 配置转换为标准的 resource 实例。

## 使用示例

### 创建 Resource 实例

```typescript
import { z } from 'zod';
import { packResource } from './common/resources.js';

const myResourceSchema = z.object({
  uri: z.string().min(1),
});

const myResourceHandler = async (request: TResourceRequest) => {
  const { uri } = myResourceSchema.parse(request.params);

  // 处理 resource 逻辑
  const content = await readResourceContent(uri);

  return {
    contents: [
      {
        uri: uri,
        mimeType: 'text/plain',
        text: content,
      },
    ],
  };
};

const myResourceInstance = packResource({
  description: 'A resource for reading file content',
  inputSchema: myResourceSchema,
  handler: myResourceHandler,
});
```

### 注册和挂载

```typescript
import { registerResource, mountServerResource } from './common/resources.js';

// 注册 resource
registerResource('my_resource', myResourceInstance);

// 挂载到服务器
mountServerResource(server);
```

## 类型定义

### IResourceConfig

```typescript
interface IResourceConfig {
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  handler: ResourceRequest;
}
```

### IResource

```typescript
interface IResource {
  description: string;
  schema: Result;
  handler: ResourceRequest;
}
```

### TResourceRequest

```typescript
type TResourceRequest = z.infer<typeof ReadResourceRequestSchema>;
```

## 与 Tools 和 Prompts 的对比

| 功能 | Tools             | Prompts             | Resources             |
| ---- | ----------------- | ------------------- | --------------------- |
| 注册 | `registerTool`    | `registerPrompt`    | `registerResource`    |
| 列表 | `listTools`       | `listPrompts`       | `listResources`       |
| 解析 | `resolveTool`     | `resolvePrompt`     | `resolveResource`     |
| 挂载 | `mountServerTool` | `mountServerPrompt` | `mountServerResource` |
| 打包 | `packTool`        | `packPrompt`        | `packResource`        |

## Resource 的特殊性

### URI 参数

Resources 使用 `uri` 参数而不是 `name` 参数，这符合 MCP 规范：

```typescript
// 正确的 resource 请求结构
{
  method: "resources/read",
  params: {
    uri: "file:///path/to/resource"
  }
}
```

### 返回格式

Resources 返回 `contents` 数组，包含资源内容：

```typescript
{
  contents: [
    {
      uri: 'file:///path/to/resource',
      mimeType: 'text/plain',
      text: 'Resource content',
    },
  ];
}
```

## 最佳实践

1. **URI 设计**: 设计清晰的 URI 模式来标识不同类型的资源
2. **MIME 类型**: 正确设置 MIME 类型以支持不同的内容格式
3. **错误处理**: 妥善处理资源不存在或访问失败的情况
4. **缓存策略**: 考虑实现适当的缓存机制以提高性能
5. **安全性**: 确保资源访问的安全性，避免路径遍历等安全问题

## 常见用例

### 文件资源

```typescript
const fileResource = async (request: TResourceRequest) => {
  const { uri } = request.params;
  const filePath = uri.replace('file://', '');
  const content = await fs.readFile(filePath, 'utf-8');

  return {
    contents: [
      {
        uri,
        mimeType: 'text/plain',
        text: content,
      },
    ],
  };
};
```

### 数据库资源

```typescript
const dbResource = async (request: TResourceRequest) => {
  const { uri } = request.params;
  const query = parseUriToQuery(uri);
  const result = await database.query(query);

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(result),
      },
    ],
  };
};
```

### 网络资源

```typescript
const webResource = async (request: TResourceRequest) => {
  const { uri } = request.params;
  const response = await fetch(uri);
  const content = await response.text();

  return {
    contents: [
      {
        uri,
        mimeType: response.headers.get('content-type') || 'text/plain',
        text: content,
      },
    ],
  };
};
```
