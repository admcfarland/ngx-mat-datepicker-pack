// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import noloops from "eslint-plugin-no-loops";
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      noloops,
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "semi": "error",
      "quotes": [
        "error",
        "single",
        {
          "avoidEscape": true,
          "allowTemplateLiterals": true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "warn",
      "noloops/no-loops": "error",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  {
    files: ['cypress/support/**/*.ts', 'projects/ngx-mat-datepicker-pack/cypress/support/**/*.ts'],
    rules: {
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }]
    }
  }
]);
