import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // BMAD Naming Convention Rules
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "typeLike",
          format: ["PascalCase"],
          message: "Type names must be PascalCase",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          message: "Variable names must be camelCase or UPPER_CASE",
        },
        {
          selector: "function",
          format: ["camelCase"],
          message: "Function names must be camelCase",
        },
        {
          selector: "classProperty",
          format: ["camelCase"],
          message: "Class properties must be camelCase",
        },
      ],
      // Component naming enforcement
      "react/display-name": "warn",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    // Additional ignores for common patterns:
    "node_modules/**",
    ".git/**",
    ".env*",
    "*.log",
    ".DS_Store",
    "_bmad/**",
    "_bmad-output/**",
    ".windsurf/**",
    ".cursor/**",
    ".claude/**",
    "coverage/**",
    "jest.config.js",
    "jest.setup.js",
  ]),
]);

export default eslintConfig;
