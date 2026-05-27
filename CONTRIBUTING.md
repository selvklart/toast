# Contributing to @selvklart/toast

## Requirements

- Node.js 18+
- npm 9+

## Getting started

```bash
git clone <repo>
cd toast
npm install
```

## Development

Start the visual playground (Vite dev server with hot reload):

```bash
npm run playground
```

The playground is in `playground/App.tsx`. It imports directly from `src/` so changes are reflected immediately without a build step.

## Building

```bash
npm run build
```

This runs `tsup` (bundles `src/index.ts` to `dist/`) and copies `src/styles.css` to `dist/styles.css`.

Output:

```
dist/
  index.js       # ESM bundle
  index.d.ts     # Type declarations
  index.d.ts.map
  styles.css     # Copied from src/styles.css
```

## Type checking

```bash
npm run typecheck
```

Runs `tsc --noEmit`. No emitted files — just type validation.

## Tests

```bash
npm test           # single pass
npm run test:watch # watch mode
```

Tests use [Vitest](https://vitest.dev/) with jsdom and `@testing-library/react`. `motion/react` is mocked in `src/test/setup.ts` since Framer Motion does not run in jsdom.

Use `vi.useFakeTimers()` in any test that involves auto-dismiss timeouts.

## Project structure

```
src/
  index.ts              # Public package exports
  types.ts              # All shared TypeScript types
  cn.ts                 # clsx + tailwind-merge utility
  toast-queue.ts        # ToastQueue class and toast imperative API
  use-toast-queue.ts    # useSyncExternalStore hook
  toast-item.tsx        # Single toast component (timer, slots, animation)
  toast-region.tsx      # Mounting component (subscribes to queue)
  styles.css            # CSS custom properties per variant
  test/
    setup.ts            # Vitest setup: jest-dom matchers + motion mock

playground/
  App.tsx               # Visual test harness
  main.tsx
  index.html
  vite.config.ts
  styles.css
```

## Key constraints

- **No icon library.** Icons are `ReactNode` provided by the consumer via `<ToastRegion icons={…} />`. The close button uses an inline SVG.
- **No Digdir/NAV tokens.** Colors are hardcoded CSS custom properties in `src/styles.css`.
- **`motion` is a peer dependency.** Import from `motion/react`. Do not bundle it — it must stay in `external` in `tsup.config.ts`.
- **Tailwind for layout only.** Variant colors live in `src/styles.css`, not Tailwind classes.
- **`clsx` and `tailwind-merge` are direct dependencies.** Use `cn` from `src/cn.ts` for all `className` merging.

## Slot prop merge hierarchy

`ToastItem` applies slot props in this order (later wins):

1. **`slotProps`** — global defaults set on `ToastRegion`, forwarded to every item
2. **`variantSlotProps[variant]`** — variant-specific overrides set on `ToastRegion`

`className` at each level is composed via `cn` (not replaced). `style` is shallow-merged. Event handlers at each level are composed. The merge happens inside `mergeSlotProps` / `mergeSlot` in `src/toast-item.tsx`.

## Adding a new slot to `ToastSlotProps`

1. Add the slot type to `ToastSlotProps` in `src/types.ts`
2. Add the slot key to `mergeSlotProps` in `src/toast-item.tsx`
3. Destructure it from the merged result in `ToastItem`
4. Spread the slot props on the target element, merging `className` via `cn` and `style` via object spread (slot style last)
5. Compose any internal event handlers with the consumer's handler
6. Add a test in `src/toast-item.test.tsx` covering className merge and handler composition
