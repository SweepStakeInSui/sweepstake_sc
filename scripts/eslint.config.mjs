// import tsParser from '@typescript-eslint/parser'
// import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
// import tseslint from 'typescript-eslint'
// import eslint from '@eslint/js'
//
// export default [
//   eslint.configs.recommended,
//   ...tseslint.configs.recommended,
//   {
//     languageOptions: {
//       globals: {},
//       parser: tsParser,
//       ecmaVersion: 5,
//       sourceType: 'module',
//
//       parserOptions: {
//         project: ['./tsconfig.json'],
//       },
//     },
//
//     rules: {
//       '@typescript-eslint/no-non-null-assertion': 'off',
//       '@typescript-eslint/ban-ts-comment': 'off',
//
//       '@typescript-eslint/explicit-module-boundary-types': 'off',
//       '@typescript-eslint/no-unused-vars': 'warn',
//       '@typescript-eslint/no-floating-promises': 'warn',
//     },
//   },
//   {
//     files: ['tests/gen/**/*.ts', 'examples/gen/**/*.ts'],
//     rules: {
//       '@typescript-eslint/ban-types': 'off',
//       '@typescript-eslint/no-explicit-any': 'off',
//       '@typescript-eslint/no-unused-vars': 'off',
//     },
//   },
//   eslintPluginPrettierRecommended,
// ]

import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import js from '@eslint/js';
import {FlatCompat} from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/.eslintrc.js', '**/.husky', '**/dist', '**/node_modules'],
  },
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
