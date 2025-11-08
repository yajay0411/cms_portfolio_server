import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';

export default [
  // JS recommended rules
  js.configs.recommended,

  // TS recommended rules
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx,js}'],

    ignores: ['dist', 'node_modules', 'logs', 'coverage'],

    plugins: {
      import: pluginImport,
      '@typescript-eslint': tseslint.plugin
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },

    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'off', // handled by TS version
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'prefer-const': 'error',

      // import plugin rules
      'import/no-unused-modules': 'warn'
    }
  },

  // must be last to override conflicting rules
  prettier
];
