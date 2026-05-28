# @selvklart/toast — Context

## Glossary

**ToastQueue**
The pub/sub singleton that holds the ordered list of pending toasts. Exposes `add`, `remove`, `subscribe`, and `getSnapshot`. There is one shared instance (`defaultQueue`) for the entire app. Components subscribe via `useSyncExternalStore`.

**toast**
The public imperative API. A callable function (`toast(input)`) extended with variant shorthand methods (`toast.success`, `toast.error`, `toast.info`, `toast.warning`) and `toast.dismiss(id)`. All methods delegate to `ToastQueue`. This is what consumers call from event handlers and server responses.

**ToastItem** *(type)*
A single entry in the queue. Combines `ToastInput` (title, variant, and all options) with a generated `id` string. The queue holds an array of these.

**ToastItem** *(component)*
The React component that renders one toast. Receives a `ToastItem` type object as `item`, an optional `resolvedIcon` (pre-resolved by `ToastRegion` from the icons config), and optional `slotProps` for per-slot customisation. Manages its own dismiss timer.

**ToastRegion**
The mounting component. Subscribes to the queue via `useToastQueue`, slices to `maxVisibleToasts`, and renders each `ToastItem` inside an `AnimatePresence`. Accepts `icons`, `ariaLabel`, `className` (applied to the root wrapper, useful for cascading CSS variable overrides), `slotProps` (forwarded to every `ToastItem`), `variantSlotProps` (per-variant slot props merged on top of `slotProps`), and `placement` (screen position). Placed once at the app root.

**placement**
One of `'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`. Set on `ToastRegion`. Controls where the toast stack is anchored on screen and which direction each `ToastItem` slides in/out from. Not overridable per toast. Default: `'bottom-right'`.

**variant**
One of `'success' | 'error' | 'info' | 'warning'`. Determines which CSS custom properties are applied via `data-variant` attribute and `src/styles.css`.

**resolvedIcon**
The icon `ReactNode` that `ToastRegion` passes to `ToastItem` after looking up `icons[item.variant]`. Distinct from `item.icon`, which is a per-toast override set by the caller. Priority: `item.icon` > `resolvedIcon` > nothing.

**slotProps**
A prop on `ToastItem` (and `ToastRegion`) that exposes each visual slot as a typed props object. Slots: `root`, `icon`, `title`, `description`, `actionButton`, `closeButton`. Each slot accepts the full HTML props of its element — `className` is merged via `cn`, `style` is shallow-merged, event handlers are composed (consumer handler runs alongside internal handler, not instead of it). When set on `ToastRegion`, it acts as a global default forwarded to every `ToastItem`.

**variantSlotProps**
A `Partial<Record<ToastVariant, ToastSlotProps>>` on `ToastRegion`. Provides per-variant slot prop overrides that are merged on top of the region-level `slotProps` inside `ToastItem`. Merge order: `slotProps` → `variantSlotProps[variant]`. `className` is composed via `cn`; `style` is shallow-merged. Enables styling each variant differently without touching CSS.

**ToastIcons**
A `Partial<Record<ToastVariant, ReactNode>>` passed to `ToastRegion`. Sets the default icon per variant for the entire region. Consumers provide their own icon components — there is no bundled icon library.

**cn**
The internal className merge utility: `clsx` + `tailwind-merge`. Used everywhere slot classNames are composed. Exported from `src/cn.ts`.
