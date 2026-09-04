import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    ".output/**",
    ".wxt/**",
    "node_modules/**",
    "src/generated/**",
    "Stuudium-Intentional-Dark.user.css",
  ]),
  {
    files: ["**/*.{js,mjs,ts}"],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["src/shared/**/*.ts", "src/features/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "browser", message: "Use a platform adapter instead." },
        { name: "chrome", message: "Use a platform adapter instead." },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["wxt", "wxt/*", "*/platforms/*"],
              message: "Shared features must receive platform behavior through an interface.",
            },
          ],
        },
      ],
    },
  },
);
