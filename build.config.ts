import { defineBuildConfig } from 'unbuild';

const isDev = process.argv.includes('--dev');

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
});
