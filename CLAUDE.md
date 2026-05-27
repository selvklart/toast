# @selvklart/toast — Claude instructions

## Commands

```bash
npm run build        # tsup + Tailwind CLI compiles src/tw.css → dist/styles.css
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
- **`clsx` and `tailwind-merge` are direct dependencies.** Use the `cn` utility from `src/cn.ts` for all className merging.
- **Tailwind for layout only.** Variant colors live in `src/styles.css` as CSS custom properties (`--toast-bg`, `--toast-icon-color`, etc.), not Tailwind classes.

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

The build script runs `tailwindcss -i src/tw.css -o dist/styles.css`. `src/tw.css` imports `tailwindcss/utilities`, sources `src/` for class names, and imports `src/styles.css` for the custom properties. The compiled `dist/styles.css` contains pre-built Tailwind utility classes + variant custom properties — consumers need no Tailwind configuration of their own.

## Testing rules

- Mock `motion/react` in `src/test/setup.ts` — Framer Motion does not run in jsdom
- Use `vi.useFakeTimers()` for any test involving auto-dismiss timeouts
- Test behavior (queue state, timer logic, slot prop merging) — not snapshot rendering
