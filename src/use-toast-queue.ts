'use client';

import {useSyncExternalStore} from 'react';

import {toast} from './toast-queue';
import type {ToastItem} from './types';

const emptySnapshot: ToastItem[] = [];

export function useToastQueue(queue = toast.queue) {
	return useSyncExternalStore(
		queue.subscribe,
		queue.getSnapshot,
		() => emptySnapshot,
	);
}
