import fs from 'fs';
import path from 'path';
import { defineBuildConfig } from 'unbuild';

const isDev = process.argv.includes('--dev');

const done = () => {
  const distPath = './build/index.mjs';
  const filePath = path.resolve(process.cwd(), distPath);
  // 添加 Shebang
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.startsWith('#!/usr/bin/env node')) {
    fs.writeFileSync(filePath, `#!/usr/bin/env node\n${content}`);
  }

  // 添加执行权限
  fs.chmodSync(filePath, 0o755);

  // 复制模板文件到build目录
  const templatesDir = path.join(process.cwd(), 'templates');
  const buildTemplatesDir = path.join(process.cwd(), 'build', 'templates');

  if (fs.existsSync(templatesDir)) {
    // 确保build/templates目录存在
    if (!fs.existsSync(buildTemplatesDir)) {
      fs.mkdirSync(buildTemplatesDir, { recursive: true });
    }

    // 复制模板文件
    copyDir(templatesDir, buildTemplatesDir);
    console.log('Templates copied to build directory');
  }
};

// 递归复制目录的辅助函数
function copyDir(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  outDir: 'build',
  rollup: {
    emitCJS: false,
    esbuild: {
      minify: !isDev,
    },
  },
  hooks: {
    'build:done': done,
  },
});
