module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
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
};
