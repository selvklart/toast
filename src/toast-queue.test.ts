import {beforeEach, describe, expect, it} from 'vitest';

import {toast} from './toast-queue';

beforeEach(() => {
	const snapshot = toast.queue.getSnapshot();
	for (const item of snapshot) {
		toast.dismiss(item.id);
	}
});

describe('toast queue', () => {
	it('toast.success adds an item with variant: success', () => {
		const id = toast.success('msg');
		const items = toast.queue.getSnapshot();
		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({id, title: 'msg', variant: 'success'});
	});

	it('toast.dismiss removes the item with that id', () => {
		const id = toast.success('msg');
		toast.dismiss(id);
		expect(toast.queue.getSnapshot()).toHaveLength(0);
	});

	it('multiple toasts accumulate in order', () => {
		toast.success('first');
		toast.error('second');
		toast.info('third');
		const items = toast.queue.getSnapshot();
		expect(items).toHaveLength(3);
		expect(items[0].title).toBe('first');
		expect(items[1].title).toBe('second');
		expect(items[2].title).toBe('third');
	});

	it('timeout defaults to 5000 when not specified', () => {
		toast.success('msg');
		const items = toast.queue.getSnapshot();
		expect(items[0].timeout).toBe(5000);
	});

	it('toast.error adds an item with variant: error', () => {
		const id = toast.error('err msg');
		const items = toast.queue.getSnapshot();
		expect(items[0]).toMatchObject({
			id,
			title: 'err msg',
			variant: 'error',
		});
	});

	it('toast.info adds an item with variant: info', () => {
		const id = toast.info('info msg');
		const items = toast.queue.getSnapshot();
		expect(items[0]).toMatchObject({
			id,
			title: 'info msg',
			variant: 'info',
		});
	});

	it('toast.warning adds an item with variant: warning', () => {
		const id = toast.warning('warn msg');
		const items = toast.queue.getSnapshot();
		expect(items[0]).toMatchObject({
			id,
			title: 'warn msg',
			variant: 'warning',
		});
	});

	it('custom timeout is respected', () => {
		toast.success('msg', {timeout: 3000});
		const items = toast.queue.getSnapshot();
		expect(items[0].timeout).toBe(3000);
	});

	it('timeout: false is preserved', () => {
		toast.error('persistent', {timeout: false});
		const items = toast.queue.getSnapshot();
		expect(items[0].timeout).toBe(false);
	});
});
