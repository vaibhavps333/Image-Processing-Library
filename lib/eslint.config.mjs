import { ESLint } from 'eslint';
import importPlugin from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-node';
import promisePlugin from 'eslint-plugin-promise';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
      },
      globals: {
        File: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        document: 'readonly',
        CanvasRenderingContext2D: 'readonly'
      }
    },
    plugins: {
      import: importPlugin,
      node: nodePlugin,
      promise: promisePlugin,
      '@typescript-eslint': typescriptPlugin
      
    },
    rules: {
      'import/no-unresolved': 'false',
      'node/no-missing-import': 'false',
      'promise/always-return': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'indent': ['error', 2],
      // 'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-console': 'warn',
      'no-unused-vars': ['warn', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }],
      'no-undef': 'off',
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'eol-last': ['error', 'always'],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'arrow-spacing': ['error', { 'before': true, 'after': true }],
      'comma-dangle': ['error', 'never'],
      'keyword-spacing': ['error', { 'before': true, 'after': true }],
      'space-before-blocks': ['error', 'always'],
      'object-curly-spacing': ['error', 'always']
    },
    ignores: ['dist/']
  }
];
