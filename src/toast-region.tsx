'use client';

import {AnimatePresence} from 'motion/react';

import {ToastItem} from './toast-item';
import type {ToastRegionProps} from './types';
import {useToastQueue} from './use-toast-queue';

import './styles.css';

export function ToastRegion({
	maxVisibleToasts = 10,
	icons,
	ariaLabel = 'Notifications',
	className,
	slotProps,
	variantSlotProps,
	placement = 'bottom-right',
}: ToastRegionProps) {
	const toasts = useToastQueue();
	const visibleToasts =
		maxVisibleToasts > 0 ? toasts.slice(-maxVisibleToasts) : [];

	return (
		<div
			role="region"
			aria-label={ariaLabel}
			tabIndex={-1}
			className={className}
		>
			<ol className="toast-region" data-placement={placement}>
				<AnimatePresence mode="popLayout" initial={false}>
					{visibleToasts.map((item) => (
						<ToastItem
							key={item.id}
							item={item}
							resolvedIcon={icons?.[item.variant]}
							slotProps={slotProps}
							variantSlotProps={variantSlotProps?.[item.variant]}
							placement={placement}
						/>
					))}
				</AnimatePresence>
			</ol>
		</div>
	);
}
