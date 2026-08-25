// Shared flat ESLint config (ESLint 9+). Extended by each app/package's
// own eslint.config.js. AUTHORED — requires `eslint`, `typescript-eslint`
// installed to actually run; see repo-level VALIDATION.md.
//
// @ts-check
export default [
  {
    ignores: ["dist/**", ".next/**", ".turbo/**", "node_modules/**"],
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
