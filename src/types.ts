import type {ComponentPropsWithoutRef, HTMLAttributes, ReactNode} from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type Placement =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export type ToastAction = {
	label: string;
	onClick: () => void;
};

export type ToastOptions = {
	/** Auto-dismiss timeout in ms. Set to `false` to require manual close. @default 5000 */
	timeout?: number | false;
	/** Custom icon to override the default variant icon */
	icon?: ReactNode;
	/** Optional action button */
	action?: ToastAction;
	/** Optional description shown below the title */
	description?: string;
	/** Whether to show the variant icon. @default true */
	showIcon?: boolean;
};

export type ToastInput = ToastOptions & {
	title: string;
	variant: ToastVariant;
};

export type ToastItem = ToastInput & {
	id: string;
};

/** Per-variant icon overrides. Pass ReactNode for each variant you want an icon for. */
export type ToastIcons = Partial<Record<ToastVariant, ReactNode>>;

/** Override props for individual slots inside ToastItem. className is merged via cn. */
export type ToastSlotProps = {
	root?: HTMLAttributes<HTMLDivElement>;
	icon?: HTMLAttributes<HTMLSpanElement>;
	title?: HTMLAttributes<HTMLSpanElement>;
	description?: HTMLAttributes<HTMLParagraphElement>;
	actionButton?: ComponentPropsWithoutRef<'button'>;
	closeButton?: ComponentPropsWithoutRef<'button'>;
};

export type ToastRegionProps = {
	/** Maximum number of visible toasts. @default 10 */
	maxVisibleToasts?: number;
	/**
	 * Icons to show per variant. No icon is shown for a variant unless you provide one here
	 * or via the per-toast `icon` option.
	 */
	icons?: ToastIcons;
	/** Accessible label for the toast region. @default "Notifications" */
	ariaLabel?: string;
	/** className applied to the root element. Useful for setting CSS custom properties for theming. */
	className?: string;
	/** slotProps forwarded to every ToastItem rendered in this region. */
	slotProps?: ToastSlotProps;
	/** Per-variant slotProps. Merged on top of slotProps, so variant overrides global defaults. */
	variantSlotProps?: Partial<Record<ToastVariant, ToastSlotProps>>;
	/** Position of the toast stack on screen. @default 'bottom-right' */
	placement?: Placement;
};
