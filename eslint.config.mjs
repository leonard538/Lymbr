import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

// Base config for the TypeScript packages (apps/api, packages/shared).
// apps/mobile has its own config built on eslint-config-expo.
export default defineConfig([
  globalIgnores(['**/node_modules/', '**/dist/', '**/coverage/', '**/.turbo/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  prettier,
]);
