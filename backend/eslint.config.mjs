// @ts-check
import eslint from '@eslint/js';
import * as importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import * as eslintPluginDrizzle from 'eslint-plugin-drizzle';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  // @ts-ignore
  importPlugin.flatConfigs.recommended,
  // @ts-ignore
  importPlugin.flatConfigs.typescript,
  eslintPluginDrizzle.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {}
      }
    },
  },
  {
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',     // Built-in imports (come from NodeJS)
            'external',    // npm install packages
            'internal',    // Imports from within the app
            ['sibling', 'parent'], // Relative imports
            'index',       // Imports from index file
            'object',      // Object imports
            'type'         // Type imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc', // Sort in ascending order
            caseInsensitive: true // Ignore case
          }
        }
      ]
    },
  },
);