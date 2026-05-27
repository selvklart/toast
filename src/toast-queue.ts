import type {ToastInput, ToastItem, ToastOptions, ToastVariant} from './types';

type Listener = () => void;

const DEFAULT_TIMEOUT = 5000;

let nextId = 0;

export class ToastQueue {
	private items: ToastItem[] = [];
	private listeners = new Set<Listener>();

	add(input: ToastInput): string {
		const id = String(++nextId);
		const item: ToastItem = {...input, id};
		this.items = [...this.items, item];
		this.emit();
		return id;
	}

	remove(id: string) {
		this.items = this.items.filter((item) => item.id !== id);
		this.emit();
	}

	subscribe = (listener: Listener): (() => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	getSnapshot = (): ToastItem[] => {
		return this.items;
	};

	private emit() {
		for (const listener of this.listeners) {
			listener();
		}
	}
}

const defaultQueue = new ToastQueue();

function createToastFn(variant: ToastVariant) {
	return (title: string, options?: ToastOptions): string => {
		return defaultQueue.add({
			title,
			variant,
			timeout: options?.timeout ?? DEFAULT_TIMEOUT,
			icon: options?.icon,
			action: options?.action,
			description: options?.description,
			showIcon: options?.showIcon,
		});
	};
}

function toastFn(input: ToastInput): string {
	return defaultQueue.add({
		timeout: DEFAULT_TIMEOUT,
		...input,
	});
}

export const toast = Object.assign(toastFn, {
	success: createToastFn('success'),
	error: createToastFn('error'),
	info: createToastFn('info'),
	warning: createToastFn('warning'),
	dismiss: (id: string) => defaultQueue.remove(id),
	queue: defaultQueue,
});
