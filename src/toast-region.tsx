'use client';

import {AnimatePresence} from 'motion/react';

import {cn} from './cn';
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
}: ToastRegionProps) {
	const toasts = useToastQueue();
	const visibleToasts = maxVisibleToasts > 0 ? toasts.slice(-maxVisibleToasts) : [];

	return (
		<div
			role="region"
			aria-label={ariaLabel}
			tabIndex={-1}
			className={className}
		>
			<ol
				className={cn(
					'fixed',
					'bottom-4',
					'right-4',
					'z-[9999]',
					'flex',
					'flex-col',
					'gap-2',
					'pointer-events-none',
				)}
			>
				<AnimatePresence mode="popLayout" initial={false}>
					{visibleToasts.map((item) => (
						<ToastItem
							key={item.id}
							item={item}
							resolvedIcon={icons?.[item.variant]}
							slotProps={slotProps}
							variantSlotProps={variantSlotProps?.[item.variant]}
						/>
					))}
				</AnimatePresence>
			</ol>
		</div>
	);
}
