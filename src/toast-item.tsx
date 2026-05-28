'use client';

import {useCallback, useEffect, useRef} from 'react';
import {motion} from 'motion/react';

import {cn} from './cn';
import {toast} from './toast-queue';
import type {
	ToastItem as ToastItemType,
	ToastSlotProps,
	ToastVariant,
} from './types';

type Props = {
	item: ToastItemType;
	resolvedIcon?: React.ReactNode;
	slotProps?: ToastSlotProps;
	variantSlotProps?: ToastSlotProps;
};

function mergeSlot<T extends {className?: string; style?: React.CSSProperties}>(
	base?: T,
	override?: T,
): T | undefined {
	if (!base && !override) {
		return undefined;
	}
	if (!base) {
		return override;
	}
	if (!override) {
		return base;
	}
	return {
		...base,
		...override,
		className: cn(base.className, override.className),
		style: {...base.style, ...override.style},
	};
}

function mergeSlotProps(
	base?: ToastSlotProps,
	override?: ToastSlotProps,
): ToastSlotProps {
	if (!base && !override) {
		return {};
	}
	if (!base) {
		return override ?? {};
	}
	if (!override) {
		return base;
	}
	return {
		root: mergeSlot(base.root, override.root),
		icon: mergeSlot(base.icon, override.icon),
		title: mergeSlot(base.title, override.title),
		description: mergeSlot(base.description, override.description),
		actionButton: mergeSlot(base.actionButton, override.actionButton),
		closeButton: mergeSlot(base.closeButton, override.closeButton),
	};
}

const variantRole = {
	error: 'alert',
	warning: 'alert',
	info: 'status',
	success: 'status',
} as const satisfies Record<ToastVariant, 'alert' | 'status'>;

export function ToastItem({
	item,
	resolvedIcon,
	slotProps,
	variantSlotProps,
}: Props) {
	const {id, title, variant, timeout, icon, action, description, showIcon} =
		item;

	const remainingRef = useRef(typeof timeout === 'number' ? timeout : 0);
	const startTimeRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	const dismiss = useCallback(() => {
		toast.dismiss(id);
	}, [id]);

	const startTimer = useCallback(() => {
		if (timeout === false || remainingRef.current <= 0) {
			return;
		}
		startTimeRef.current = Date.now();
		timerRef.current = setTimeout(dismiss, remainingRef.current);
	}, [timeout, dismiss]);

	const pauseTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = undefined;
			const elapsed = Date.now() - startTimeRef.current;
			remainingRef.current = Math.max(0, remainingRef.current - elapsed);
		}
	}, []);

	useEffect(() => {
		startTimer();
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [startTimer]);

	const activeIcon = icon ?? resolvedIcon;
	const shouldShowIcon = showIcon !== false && !!activeIcon;

	const {
		root: rootProps,
		icon: iconProps,
		title: titleProps,
		description: descriptionProps,
		actionButton: actionButtonProps,
		closeButton: closeButtonProps,
	} = mergeSlotProps(slotProps, variantSlotProps);

	return (
		<li>
			<motion.div
				layout
				role={variantRole[variant]}
				aria-atomic="true"
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				{...(rootProps as any)}
				className={cn(
					'toast-item',
					'pointer-events-auto',
					'flex',
					'items-start',
					'gap-2',
					'md:gap-3',
					'rounded-md',
					'px-4',
					'py-4',
					'shadow-md',
					'w-[min(24rem,calc(100vw-2.8rem))]',
					rootProps?.className,
				)}
				data-variant={variant}
				style={{
					backgroundColor: 'var(--toast-bg)',
					color: 'var(--toast-text-color)',
					...rootProps?.style,
				}}
				initial={{opacity: 0, x: '100%'}}
				animate={{opacity: 1, x: 0}}
				exit={{opacity: 0, x: '100%'}}
				transition={{type: 'spring', bounce: 0, duration: 0.35}}
				onMouseEnter={pauseTimer}
				onMouseLeave={startTimer}
				onFocus={pauseTimer}
				onBlur={startTimer}
			>
				{shouldShowIcon && (
					<span
						{...iconProps}
						className={cn('shrink-0', iconProps?.className)}
						style={{
							color: 'var(--toast-icon-color)',
							...iconProps?.style,
						}}
						aria-hidden
					>
						{activeIcon}
					</span>
				)}

				<div
					className={cn('flex-1', 'min-w-0', 'relative', 'top-0.5')}
				>
					<span
						{...titleProps}
						className={cn(
							'text-sm',
							'md:text-base',
							'font-semibold',
							'block',
							titleProps?.className,
						)}
					>
						{title}
					</span>
					{description && (
						<p
							{...descriptionProps}
							className={cn(
								'text-sm',
								'md:text-base',
								'mt-1',
								'opacity-90',
								descriptionProps?.className,
							)}
						>
							{description}
						</p>
					)}
				</div>

				{action && (
					<button
						type="button"
						{...actionButtonProps}
						onClick={(e) => {
							action.onClick();
							dismiss();
							actionButtonProps?.onClick?.(e);
						}}
						className={cn(
							'shrink-0',
							'text-base',
							'font-semibold',
							'underline',
							'underline-offset-2',
							'cursor-pointer',
							actionButtonProps?.className,
						)}
						style={{
							color: 'var(--toast-icon-color)',
							...actionButtonProps?.style,
						}}
					>
						{action.label}
					</button>
				)}

				<button
					type="button"
					aria-label="Close notification"
					{...closeButtonProps}
					onClick={(e) => {
						dismiss();
						closeButtonProps?.onClick?.(e);
					}}
					className={cn(
						'shrink-0',
						'rounded-sm',
						'p-1',
						'opacity-70',
						'transition-all',
						'hover:opacity-100',
						'focus-visible:outline',
						'focus-visible:outline-2',
						'focus-visible:outline-offset-2',
						'focus-visible:bg-[var(--toast-button-hover)]',
						'hover:bg-[var(--toast-button-hover)]',
						'cursor-pointer',
						closeButtonProps?.className,
					)}
				>
					<svg
						aria-hidden
						width="1.4rem"
						height="1.4rem"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M18 6 6 18M6 6l12 12" />
					</svg>
				</button>
			</motion.div>
		</li>
	);
}
