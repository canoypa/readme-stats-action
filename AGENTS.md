# readme-stats-action

GitHub Action that fetches GitHub activity via API and writes formatted stats into Markdown files.

Users run this in their GitHub Actions workflow to keep their README automatically updated. **Keeping the action simple, reliable, and easy to extend is the primary goal.**

## When making changes

**Adding a stat** is the most common task. Each stat is a `fetcher/*.ts` + `renderer/*.ts` pair:
- Fetcher returns raw data only — no formatting, no sorting
- Renderer formats data into a Markdown string — sorting and display logic belongs here
- Add concurrent fetching with `Promise.all()` in `fetcher/contribution.ts`
- Marker name must be lowercase kebab-case: `my-stat` → `<!-- readme-stats:my-stat:start -->`
- Avoid modifying `applyStats()` in `index.ts` — it handles all stats generically

**When releasing**, rebuild and commit `dist/`:
```bash
pnpm build
git add dist/index.js dist/index.js.map
```
`action.yml` runs `dist/index.js` directly — skipping this breaks the action.

## Pitfalls

- `import type` is required for type-only imports (`verbatimModuleSyntax: true`) — missing it causes a TypeScript error
- Tests must define all mocks inside `vi.hoisted()` — mocks defined outside won't work with vitest's hoisting

## Commands

```bash
pnpm check      # biome lint + format — run after every change to src/
pnpm test run   # vitest run-once (not watch mode)
pnpm build      # tsup → dist/index.js  (release only)
```
