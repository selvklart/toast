import {render, screen} from '@testing-library/react';
import {configureAxe} from 'jest-axe';
import {beforeEach, describe, expect, it} from 'vitest';

import {toast} from './toast-queue';
import {ToastRegion} from './toast-region';

const configuredAxe = configureAxe({
	rules: {'color-contrast': {enabled: false}},
});

beforeEach(() => {
	const snapshot = toast.queue.getSnapshot();
	for (const item of snapshot) {
		toast.dismiss(item.id);
	}
});

describe('icons config', () => {
	it('renders icon when icons.success is provided', () => {
		toast.success('Saved');
		render(
			<ToastRegion
				icons={{success: <span data-testid="success-icon" />}}
			/>,
		);
		expect(screen.getByTestId('success-icon')).toBeInTheDocument();
	});

	it('does not render icon element when no icon provided for variant', () => {
		toast.info('Hello');
		render(<ToastRegion />);
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
		const spans = document.querySelectorAll('span[aria-hidden]');
		expect(spans).toHaveLength(0);
	});

	it('per-toast item.icon takes priority over icons[variant]', () => {
		const itemIcon = <span data-testid="item-icon" />;
		const regionIcon = <span data-testid="region-icon" />;
		toast.success('Msg', {icon: itemIcon});
		render(<ToastRegion icons={{success: regionIcon}} />);
		expect(screen.getByTestId('item-icon')).toBeInTheDocument();
		expect(screen.queryByTestId('region-icon')).not.toBeInTheDocument();
	});

	it('renders multiple toasts', () => {
		toast.success('First');
		toast.error('Second');
		render(<ToastRegion />);
		expect(screen.getByText('First')).toBeInTheDocument();
		expect(screen.getByText('Second')).toBeInTheDocument();
	});

	it('respects maxVisibleToasts', () => {
		toast.success('One');
		toast.success('Two');
		toast.success('Three');
		render(<ToastRegion maxVisibleToasts={2} />);
		expect(screen.queryByText('One')).not.toBeInTheDocument();
		expect(screen.getByText('Two')).toBeInTheDocument();
		expect(screen.getByText('Three')).toBeInTheDocument();
	});
});

describe('accessibility', () => {
	it('container has role="region" and is a programmatic focus target', () => {
		render(<ToastRegion />);
		const region = screen.getByRole('region');
		expect(region).toHaveAttribute('tabindex', '-1');
	});

	it('aria-label defaults to "Notifications"', () => {
		render(<ToastRegion />);
		expect(screen.getByRole('region')).toHaveAccessibleName(
			'Notifications',
		);
	});

	it('ariaLabel prop sets the region label', () => {
		render(<ToastRegion ariaLabel="Varsler" />);
		expect(screen.getByRole('region')).toHaveAccessibleName('Varsler');
	});

	it('passes axe audit with toasts rendered', async () => {
		toast.success('Saved');
		toast.error('Something went wrong');
		const {container} = render(<ToastRegion />);
		expect(await configuredAxe(container)).toHaveNoViolations();
	});
});
