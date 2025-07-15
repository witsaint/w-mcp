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
};

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
