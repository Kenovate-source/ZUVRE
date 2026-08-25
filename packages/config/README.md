# @zuvre/config

Shared TypeScript, ESLint, and Tailwind configuration, consumed by every app/package.

## Public API
`./typescript/base`, `./eslint/base`, `./tailwind/base` subpath exports.

## Ownership
Owner: `@zuvre/platform-core`.

## Validation status
`typescript/base.json` is real and already in use (every package's `tsconfig.json` extends the root `tsconfig.base.json`, which this re-exports). `eslint/base.js` and `tailwind/base.js` are authored but not executed — `eslint` and `tailwindcss` are not installed in this sandbox.
