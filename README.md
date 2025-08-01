# TCFE MCP (Model Context Protocol)

这是一个基于MCP协议的AI Agent工具库，提供了文档生成、模板管理等功能。

## 功能特性

- 📝 文档生成和管理
- 🎨 Nextra文档模板
- 🔧 工具集成
- 📚 资源管理
- 💬 提示词管理

## 安装

```bash
# 克隆仓库
git clone <repository-url>
cd w-mcp

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

## 使用方法

### 1. 作为本地MCP服务器

```bash
# 开发模式
pnpm dev

# 构建并运行
pnpm build
node build/index.mjs
```

### 2. 作为nodelib库使用

```javascript
import { createServerInstance } from 'tcfe-mcp';

const server = createServerInstance();
// 使用服务器实例
```

### 3. 环境变量配置

你可以通过环境变量来配置模板目录：

```bash
export MCP_TEMPLATE_DIR=/path/to/your/templates
```

## 模板路径解析

MCP库会自动尝试在以下位置查找模板目录：

1. **环境变量**: `MCP_TEMPLATE_DIR`
2. **当前工作目录**: `./templates/`
3. **脚本相对位置**: 相对于执行文件的templates目录
4. **构建目录**: `build/templates/`
5. **包安装位置**: `node_modules/tcfe-mcp/templates/`
6. **全局安装位置**: `../templates/`

### 路径解析策略

库会按以下顺序查找模板：

```javascript
const possiblePaths = [
  process.env.MCP_TEMPLATE_DIR, // 环境变量
  path.join(process.cwd(), './templates/'), // 当前目录
  path.join(__dirname, '../templates/'), // 相对脚本位置
  path.join(process.cwd(), 'build/templates/'), // 构建目录
  path.join(process.cwd(), 'node_modules/tcfe-mcp/templates/'), // 包安装
  path.join(process.cwd(), '../templates/'), // 全局安装
];
```

## 开发

### 项目结构

```
w-mcp/
├── src/
│   ├── common/          # 通用工具和类型
│   ├── prompts/         # 提示词管理
│   ├── resources/       # 资源管理
│   ├── tools/           # 工具实现
│   └── index.ts         # 主入口
├── templates/           # 文档模板
├── build/              # 构建输出
└── package.json
```

### 构建配置

构建过程会自动：

1. 编译TypeScript代码
2. 复制模板文件到build目录
3. 添加执行权限
4. 生成可执行文件

### 测试模板路径

```bash
# 测试开发环境
node test-template-path.js

# 测试构建后环境
node test-built-mcp.js
```

## 故障排除

### 模板找不到

如果遇到模板找不到的问题：

1. **检查环境变量**:

   ```bash
   echo $MCP_TEMPLATE_DIR
   ```

2. **手动指定路径**:

   ```bash
   export MCP_TEMPLATE_DIR=/absolute/path/to/templates
   ```

3. **检查构建输出**:

   ```bash
   ls -la build/templates/
   ```

4. **查看调试信息**:
   库会在控制台输出路径查找过程

### 常见问题

**Q: 模板路径解析失败**
A: 确保templates目录存在，或设置MCP_TEMPLATE_DIR环境变量

**Q: 构建后找不到模板**
A: 检查build.config.ts中的复制逻辑是否正确执行

**Q: 权限问题**
A: 确保build/index.mjs有执行权限：`chmod +x build/index.mjs`

## 许可证

ISC License
