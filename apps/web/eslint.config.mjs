import eslintRecommendedConfig from '@envoy1084/style-guide/eslint/flat/_base';
import eslintReactConfig from '@envoy1084/style-guide/eslint/flat/react';
import eslintTypescriptConfig from '@envoy1084/style-guide/eslint/flat/typescript';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';
import { configs } from 'typescript-eslint';

// eslint-disable-next-line tsdoc/syntax -- for type safety
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...eslintRecommendedConfig,
  ...eslintTypescriptConfig,
  ...eslintReactConfig,
  ...pluginRouter.configs['flat/recommended'],
  ...pluginQuery.configs['flat/recommended'],
  ...configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'no-console': ['off'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/restrict-template-expressions': ['warn'],
      'react/function-component-definition': [
        'warn',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          multiline: 'last',
          reservedFirst: true,
        },
      ],
      'import/order': [
        'off',
        {
          'newlines-between': 'ignore',
          alphabetize: { order: 'asc' },
        },
      ],
    },
  },
  {
    ...configs.disableTypeChecked,
    files: ['*.js?(x)', '*.mjs'],
  },
  {
    files: ['*.config.{mjs,ts,cjs,js,ts}', 'src/app/**/*.tsx'],
    rules: {
      'import/no-default-export': 'off',
      'import/prefer-default-export': ['off', { target: 'any' }],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: { 'import/no-default-export': 'off' },
  },
];
