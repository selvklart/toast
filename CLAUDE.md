# @selvklart/toast — Claude instructions

## Commands

```bash
npm run build        # tsup bundles JS; copies src/styles.css → dist/styles.css
npm run dev          # tsup in watch mode
npm run playground   # Vite dev server at playground/
npm test             # vitest run (single pass)
npm run test:watch   # vitest in watch mode
npm run typecheck    # tsc --noEmit
```

## Package constraints

- **No icon library dependency.** Icons are provided by the consumer via `<ToastRegion icons={{...}} />`. The close button uses an inline SVG. Do not add `@navikt/aksel-icons`, `lucide-react`, or any other icon package.
- **No Digdir/NAV design system tokens.** Colors are hardcoded CSS custom properties in `src/styles.css`. Do not reference `--ds-color-*` tokens.
- **`motion` is a peer dependency.** Import from `motion/react`. Do not bundle it — it must stay in `external` in `tsup.config.ts`.
- **`clsx` is a direct dependency.** Use the `cn` utility from `src/cn.ts` for all className merging. `cn` wraps `clsx` only (no `tailwind-merge`).
- **No Tailwind in the package.** All styling is hand-written, namespaced CSS in `src/styles.css` (classes are prefixed `toast-*`). The package ships **no generic utility classes** — this is deliberate so it can never collide with a consumer app's own utilities (e.g. `hidden`, `lg:block`). Do not reintroduce Tailwind utility classes into `src/*.tsx`; add a namespaced `.toast-*` rule to `src/styles.css` instead. Variant colors live in `src/styles.css` as CSS custom properties (`--toast-bg`, `--toast-icon-color`, etc.). (The `playground/` still uses Tailwind for its own demo page — that is not part of the published package.)

## slotProps pattern

`ToastItem` accepts a `slotProps` prop. `ToastRegion` additionally accepts `slotProps` (global, forwarded to every item) and `variantSlotProps` (per-variant, merged on top of `slotProps` inside `ToastItem`). Merge happens in `mergeSlotProps` / `mergeSlot` in `src/toast-item.tsx`.

When spreading slot props on an element, always:
1. Spread the merged slot object first (so consumer overrides take effect)
2. Merge `className` last via `cn(ownClasses, slotProps?.slot?.className)`
3. Merge `style` last: `{...ownStyle, ...slotProps?.slot?.style}`
4. For event handlers (e.g. `onClick` on closeButton): call both the internal handler and the consumer's handler

When adding a new slot, also add it to `mergeSlotProps` so it participates in the region-level merge.

## CSS exports

The package exports `styles.css` via `"./styles.css"` in `package.json` exports. Consumers import it as:
```ts
import '@selvklart/toast/styles.css';
```

The build script copies `src/styles.css` verbatim to `dist/styles.css` (`tsup && cp src/styles.css dist/styles.css`). `src/styles.css` is plain, hand-written CSS — all layout, spacing, typography, and variant custom properties live there as namespaced `.toast-*` rules. There is no Tailwind build step and no `src/tw.css`. Consumers need no CSS tooling of their own.

## Testing rules

- Mock `motion/react` in `src/test/setup.ts` — Framer Motion does not run in jsdom
- Use `vi.useFakeTimers()` for any test involving auto-dismiss timeouts
- Test behavior (queue state, timer logic, slot prop merging) — not snapshot rendering
