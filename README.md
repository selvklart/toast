# @selvklart/toast

A lightweight, accessible toast notification library for React with Framer Motion animations, auto-dismiss timers, and full slot-based customisation.

> [!NOTE]
> This package is developed for internal use at Selvklart. It is published publicly for convenience, but we make no guarantees about update cadence or backwards compatibility. If you depend on it externally, pin your version.

## Features

- Variant shortcuts: `success`, `error`, `info`, `warning`
- Auto-dismiss with pause-on-hover and pause-on-focus
- Persistent toasts (`timeout: false`)
- Action button per toast
- Icon support via consumer-provided `ReactNode` (no icon library bundled)
- Slot-based customisation (`slotProps`) with merged `className` and `style`
- Framer Motion enter/exit animations
- Accessible: `role="region"`, `role="alertdialog"`, `role="alert"`, `aria-atomic`
- Fully typed with TypeScript

---

## Installation

```bash
npm install @selvklart/toast
```

Install peer dependencies if you haven't already:

```bash
npm install react react-dom motion
```

---

## Setup

### 1. Import the stylesheet

```ts
import '@selvklart/toast/styles.css';
```

### 2. Mount `<ToastRegion />` once at the app root

```tsx
import {ToastRegion} from '@selvklart/toast';

export function App() {
  return (
    <>
      <YourApp />
      <ToastRegion />
    </>
  );
}
```

---

## Usage

### Variant shortcuts

```ts
import {toast} from '@selvklart/toast';

toast.success('File saved');
toast.error('Upload failed');
toast.info('New version available');
toast.warning('Unsaved changes');
```

### With options

```ts
// Custom timeout (ms)
toast.success('Done', {timeout: 3000});

// Persistent — requires manual close
toast.error('Payment failed', {timeout: false});

// With a description
toast.info('Deployment started', {
  description: 'This usually takes about 2 minutes.',
});

// With an action button
toast.info('New update available', {
  action: {
    label: 'Refresh',
    onClick: () => window.location.reload(),
  },
});
```

### Low-level call

```ts
toast({
  title: 'Custom toast',
  variant: 'success',
  timeout: 4000,
  description: 'Something happened.',
});
```

### Dismiss programmatically

```ts
const id = toast.success('Saving…');

// later
toast.dismiss(id);
```

---

## Icons

No icons are bundled. Pass a `ReactNode` per variant to `<ToastRegion icons={…} />`:

```tsx
import {CheckCircleIcon, XCircleIcon, InfoIcon, AlertTriangleIcon} from 'lucide-react';

<ToastRegion
  icons={{
    success: <CheckCircleIcon size={20} />,
    error: <XCircleIcon size={20} />,
    info: <InfoIcon size={20} />,
    warning: <AlertTriangleIcon size={20} />,
  }}
/>
```

You can also override the icon for a single toast:

```ts
toast.success('Uploaded', {icon: <MyCustomIcon />});
```

Per-toast `icon` takes priority over the region-level `icons` config.

To hide the icon for a specific toast even when one is configured globally:

```ts
toast.success('No icon here', {showIcon: false});
```

---

## `ToastRegion` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `icons` | `ToastIcons` | — | Icon per variant. No icon shown unless provided. |
| `maxVisibleToasts` | `number` | `10` | Cap on simultaneously visible toasts. Oldest are hidden first. |
| `placement` | `Placement` | `'bottom-right'` | Where the toast stack appears on screen. |
| `ariaLabel` | `string` | `"Notifications"` | Accessible label for the `role="region"` wrapper. |
| `className` | `string` | — | Applied to the root `div`. Useful for setting CSS custom properties that cascade into toasts. |
| `slotProps` | `ToastSlotProps` | — | Forwarded to every `ToastItem` in the region. Per-variant and per-toast slot props are merged on top. |
| `variantSlotProps` | `Partial<Record<ToastVariant, ToastSlotProps>>` | — | Per-variant slot props, merged on top of `slotProps`. Lets you style each variant differently without touching CSS. |

---

## Slot customisation (`slotProps`)

Slot props let you override HTML attributes on any internal element of a toast. `className` is merged (not replaced), `style` is shallow-merged, and event handlers are composed alongside internal ones.

### Region-level (applies to all toasts)

```tsx
<ToastRegion
  slotProps={{
    root: {className: 'border border-slate-200'},
    closeButton: {'aria-label': 'Lukk varsel'},
  }}
/>
```

### Per-variant (applies only to toasts of that variant)

```tsx
<ToastRegion
  variantSlotProps={{
    success: {root: {className: 'bg-green-50 border border-green-300'}},
    error:   {root: {className: 'bg-red-50 border border-red-300'}},
    warning: {closeButton: {className: 'text-amber-700'}},
  }}
/>
```

Merge order: `slotProps` (global) → `variantSlotProps[variant]`. Both `className` and `style` are merged at each level.

### Per-item (when rendering `ToastItem` directly)

```tsx
import {ToastItem} from '@selvklart/toast';

<ToastItem
  item={item}
  slotProps={{
    root: {className: 'border border-blue-300'},
    closeButton: {'aria-label': 'Lukk varsel'},
    title: {className: 'text-lg'},
    actionButton: {
      onClick: () => console.log('action clicked'),
    },
  }}
/>
```

### Available slots

| Slot | Element | Notes |
|---|---|---|
| `root` | `div` | The outermost toast card |
| `icon` | `span` | Wrapper around the variant icon |
| `title` | `span` | Toast title text |
| `description` | `p` | Description text (only rendered when `description` is set) |
| `actionButton` | `button` | Action button (only rendered when `action` is set) |
| `closeButton` | `button` | The X close button, always rendered |

---

## `useToastQueue`

Subscribe directly to the toast queue in your own component:

```tsx
import {useToastQueue} from '@selvklart/toast';

function MyCustomToastList() {
  const toasts = useToastQueue();

  return (
    <ul>
      {toasts.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

You can also subscribe to a custom queue:

```ts
import {ToastQueue, useToastQueue} from '@selvklart/toast';

const myQueue = new ToastQueue();
const toasts = useToastQueue(myQueue);
```

---

## TypeScript

All types are exported:

```ts
import type {
  Placement,
  ToastVariant,
  ToastOptions,
  ToastInput,
  ToastItem,
  ToastAction,
  ToastIcons,
  ToastSlotProps,
  ToastRegionProps,
} from '@selvklart/toast';
```

---

## Theming

### Changing toast position

Use the `placement` prop on `ToastRegion`:

```tsx
<ToastRegion placement="top-center" />
```

Available values: `'top-left'`, `'top-center'`, `'top-right'`, `'bottom-left'`, `'bottom-center'`, `'bottom-right'`. Default is `'bottom-right'`.

For fine-grained control (custom inset, etc.) you can still override the CSS directly:

```css
.toast-region {
  bottom: 2rem;
  right: 2rem;
}
```

### Colors

Colors are CSS custom properties set on `.toast-item` via `data-variant`.

### Via CSS (global override)

```css
.toast-item[data-variant='success'] {
  --toast-bg: #your-color;
  --toast-icon-color: #your-color;
  --toast-text-color: #your-color;
  --toast-button-hover: #your-color;
}
```

### Via `className` on `ToastRegion` (cascading override)

```tsx
<ToastRegion className="[--toast-bg:theme(colors.slate.100)]" />
```

### Via `variantSlotProps` (prop-based, per-variant)

```tsx
<ToastRegion
  variantSlotProps={{
    success: {root: {style: {'--toast-bg': '#f0fdf4', '--toast-icon-color': '#16a34a'} as React.CSSProperties}},
  }}
/>
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
