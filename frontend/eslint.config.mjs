// @ts-check
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default defineConfig(
  {
    ignores: ['dist/**/*']
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      '@stylistic': stylistic
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jasmine
      },
      parserOptions: {
        project: ['tsconfig.json']
      }
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case'
        }
      ],
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/prefer-standalone': 'off',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-unused-vars': ['off', { args: 'none' }],
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
      '@typescript-eslint/no-this-alias': ['error', { allowedNames: ['that'] }],
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@stylistic/member-delimiter-style': ['error', { singleline: { delimiter: 'comma' } }],
      'no-throw-literal': 'error',
      'arrow-body-style': 'off',
      'no-unused-labels': 'error',
      'no-unused-vars': ['off', { args: 'none' }],
      'no-caller': 'error',
      'no-debugger': 'error',
      'no-new-wrappers': 'error',
      'constructor-super': 'error',
      'no-empty': 'off',
      'no-eval': 'error',
      'no-var': 'error',
      'no-fallthrough': 'error',
      'no-undef': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      eqeqeq: 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }]
    }
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off'
    }
  },
  {
    files: ['**/*.html'],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility
    ],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'off'
    }
  }
);
