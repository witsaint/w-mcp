import { base, defineConfig } from '@hyperse/eslint-config-hyperse';

export default defineConfig(
  [
    ...base,
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'vitest/expect-expect': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
      },
    },
  ],
  ['**/.vscode-test']
);
