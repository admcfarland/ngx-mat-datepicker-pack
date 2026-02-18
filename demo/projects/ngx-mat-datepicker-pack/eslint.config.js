// @ts-check
import rootConfig from '../../eslint.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...rootConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "mdp",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "mdp",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    rules: {},
  },
  {
    files: ['cypress/support/**/*.ts', 'projects/ngx-mat-datepicker-pack/cypress/support/**/*.ts'],
    rules: {
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }]
    }
  }
]);
