---
"@selvklart/toast": patch
---

Remove Tailwind from the package; all styling is now collision-free, namespaced CSS.

The package no longer emits generic Tailwind utility classes (`.hidden`, `.block`,
`.flex`, …). This fixes two bugs in consuming apps:

- Responsive display utilities (e.g. `hidden lg:block`) could not be overridden, because
  the package shipped these utilities as unlayered rules that outranked the app's own
  `@layer utilities` rules.
- Theme-dependent utilities (padding, gap, border-radius, box-shadow, font sizes) were
  missing from the shipped `dist/styles.css`, so toasts rendered without spacing or
  elevation in consumer apps.

All layout, spacing, typography, and variant styles now live as hand-written `.toast-*`
rules in `dist/styles.css`. No consumer-visible API changes.
