import eslintPluginAstro from "eslint-plugin-astro";

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: [".husky,", ".vscode", "public", "dist", ".yarn", "node_modules/**", "dist/**"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        Node: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      // parser: eslintPluginAstro.parsers.astro,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    plugins: {
    },
    rules: {
    },
  },
];