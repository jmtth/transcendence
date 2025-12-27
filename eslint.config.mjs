import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/coverage/**', 
      '**/dist/**',
      '**/node_modules/**',
      '**/migrations/**',
      '**/generated/**',      // prisma sql migrations
      '**/*.d.ts',            // type definitions
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { 
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node, // Par défaut, on assume qu'on est en Backend (Node.js)
        ...globals.es2021,
        },
      },
     rules: {
       '@typescript-eslint/no-explicit-any': 'error',
       '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
       'eqeqeq': ['error', 'always'],
       'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
       'prefer-const': 'error',
     },
  },
   ...tseslint.configs.recommended,
  {
    files: ['srcs/nginx/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
      }
    }
  },
  eslintConfigPrettier,
];
