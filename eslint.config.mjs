import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
  ]),
]);

export default eslintConfig;
