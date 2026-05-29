import {act, fireEvent, render, screen} from '@testing-library/react';
import {configureAxe} from 'jest-axe';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {ToastItem} from './toast-item';
import {toast} from './toast-queue';
import type {ToastItem as ToastItemType} from './types';

function makeItem(overrides: Partial<ToastItemType> = {}): ToastItemType {
	return {
		id: 'test-id',
		title: 'Test toast',
		variant: 'info',
		timeout: 5000,
		...overrides,
	};
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.spyOn(toast, 'dismiss');
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe('timer logic', () => {
	it('auto-dismisses after timeout ms', () => {
		render(<ToastItem item={makeItem({timeout: 3000})} />);
		expect(toast.dismiss).not.toHaveBeenCalled();
		act(() => {
			vi.advanceTimersByTime(3000);
		});
		expect(toast.dismiss).toHaveBeenCalledWith('test-id');
	});

	it('timeout: false never auto-dismisses', () => {
		render(<ToastItem item={makeItem({timeout: false})} />);
		act(() => {
			vi.advanceTimersByTime(60000);
		});
		expect(toast.dismiss).not.toHaveBeenCalled();
	});

	it('timeout: 0 dismisses immediately (next tick)', () => {
		render(<ToastItem item={makeItem({timeout: 0})} />);
		expect(toast.dismiss).not.toHaveBeenCalled();
		act(() => {
			vi.advanceTimersByTime(0);
		});
		expect(toast.dismiss).toHaveBeenCalledWith('test-id');
	});

	it('onMouseEnter pauses and onMouseLeave resumes timer', () => {
		render(<ToastItem item={makeItem({timeout: 5000})} />);
		const rootDiv = screen.getByRole('status');

		act(() => {
			vi.advanceTimersByTime(2000);
		});
		fireEvent.mouseEnter(rootDiv);

		act(() => {
			vi.advanceTimersByTime(5000);
		});
		expect(toast.dismiss).not.toHaveBeenCalled();

		fireEvent.mouseLeave(rootDiv);
		act(() => {
			vi.advanceTimersByTime(3000);
		});
		expect(toast.dismiss).toHaveBeenCalledWith('test-id');
	});
});

describe('slotProps merging', () => {
	it('slotProps.closeButton aria-label overrides default', () => {
		render(
			<ToastItem
				item={makeItem()}
				slotProps={{closeButton: {'aria-label': 'Lukk varsel'}}}
			/>,
		);
		expect(
			screen.getByRole('button', {name: 'Lukk varsel'}),
		).toBeInTheDocument();
	});

	it('default close button aria-label is "Close notification"', () => {
		render(<ToastItem item={makeItem()} />);
		expect(
			screen.getByRole('button', {name: 'Close notification'}),
		).toBeInTheDocument();
	});

	it('slotProps.root.className is merged onto the root element', () => {
		render(
			<ToastItem
				item={makeItem()}
				slotProps={{root: {className: 'my-custom-class'}}}
			/>,
		);
		const rootDiv = screen.getByRole('status');
		expect(rootDiv).toHaveClass('my-custom-class');
		expect(rootDiv).toHaveClass('toast-item');
	});

	it('slotProps.closeButton.onClick fires in addition to dismiss', () => {
		const extraOnClick = vi.fn();
		render(
			<ToastItem
				item={makeItem()}
				slotProps={{closeButton: {onClick: extraOnClick}}}
			/>,
		);
		fireEvent.click(
			screen.getByRole('button', {name: 'Close notification'}),
		);
		expect(extraOnClick).toHaveBeenCalledTimes(1);
		expect(toast.dismiss).toHaveBeenCalledWith('test-id');
	});

	it('close button has transition-all class (not conflicting transition-opacity + transition-colors)', () => {
		render(<ToastItem item={makeItem()} />);
		const closeBtn = screen.getByRole('button', {
			name: 'Close notification',
		});
		expect(closeBtn).toHaveClass('transition-all');
		expect(closeBtn).not.toHaveClass('transition-opacity');
		expect(closeBtn).not.toHaveClass('transition-colors');
	});

	it('slotProps.root.onMouseEnter fires alongside internal pauseTimer', () => {
		const rootMouseEnter = vi.fn();
		render(
			<ToastItem
				item={makeItem({timeout: 5000})}
				slotProps={{root: {onMouseEnter: rootMouseEnter}}}
			/>,
		);
		fireEvent.mouseEnter(screen.getByRole('status'));
		expect(rootMouseEnter).toHaveBeenCalledTimes(1);
		// timer is still paused (internal handler still ran)
		act(() => {
			vi.advanceTimersByTime(5000);
		});
		expect(toast.dismiss).not.toHaveBeenCalled();
	});

	it('slotProps.root.onFocus fires alongside internal pauseTimer', () => {
		const rootFocus = vi.fn();
		render(
			<ToastItem
				item={makeItem({timeout: 5000})}
				slotProps={{root: {onFocus: rootFocus}}}
			/>,
		);
		fireEvent.focus(screen.getByRole('status'));
		expect(rootFocus).toHaveBeenCalledTimes(1);
		act(() => {
			vi.advanceTimersByTime(5000);
		});
		expect(toast.dismiss).not.toHaveBeenCalled();
	});

	it('slotProps.root.onMouseLeave fires alongside internal startTimer', () => {
		const rootMouseLeave = vi.fn();
		render(
			<ToastItem
				item={makeItem({timeout: 5000})}
				slotProps={{root: {onMouseLeave: rootMouseLeave}}}
			/>,
		);
		const rootDiv = screen.getByRole('status');
		fireEvent.mouseEnter(rootDiv);
		fireEvent.mouseLeave(rootDiv);
		expect(rootMouseLeave).toHaveBeenCalledTimes(1);
		// timer restarts — dismiss fires after remaining time
		act(() => {
			vi.advanceTimersByTime(5000);
		});
		expect(toast.dismiss).toHaveBeenCalledWith('test-id');
	});

	it('slotProps.root.onBlur fires alongside internal startTimer', () => {
		const rootBlur = vi.fn();
		render(
			<ToastItem
				item={makeItem({timeout: 5000})}
				slotProps={{root: {onBlur: rootBlur}}}
			/>,
		);
		const rootDiv = screen.getByRole('status');
		fireEvent.focus(rootDiv);
		fireEvent.blur(rootDiv);
		expect(rootBlur).toHaveBeenCalledTimes(1);
		// timer restarts — dismiss fires after remaining time
		act(() => {
			vi.advanceTimersByTime(5000);
		});
		expect(toast.dismiss).toHaveBeenCalledWith('test-id');
	});

	it('dismiss is called even when action.onClick throws', () => {
		const throwing = vi.fn().mockImplementation(() => {
			throw new Error('oops');
		});
		render(
			<ToastItem
				item={makeItem({
					action: {label: 'Retry', onClick: throwing},
				})}
			/>,
		);
		// React 19 re-dispatches errors from event handlers to window as an error event.
		// Suppress it with preventDefault() so Vitest doesn't treat it as unhandled.
		const handleError = (e: ErrorEvent) => e.preventDefault();
		window.addEventListener('error', handleError);
		try {
			fireEvent.click(screen.getByRole('button', {name: 'Retry'}));
		} catch {
			// swallow synchronous re-throw from React event dispatching
		}
		window.removeEventListener('error', handleError);
		expect(toast.dismiss).toHaveBeenCalledWith('test-id');
	});
});

describe('variantSlotProps merging', () => {
	it('variantSlotProps className is applied for the matching variant', () => {
		render(
			<ToastItem
				item={makeItem({variant: 'success'})}
				variantSlotProps={{root: {className: 'success-custom'}}}
			/>,
		);
		expect(screen.getByRole('status')).toHaveClass('success-custom');
	});

	it('variantSlotProps className is merged with slotProps className', () => {
		render(
			<ToastItem
				item={makeItem({variant: 'success'})}
				slotProps={{root: {className: 'global-class'}}}
				variantSlotProps={{root: {className: 'variant-class'}}}
			/>,
		);
		const root = screen.getByRole('status');
		expect(root).toHaveClass('global-class');
		expect(root).toHaveClass('variant-class');
	});

	it('variantSlotProps style is merged with slotProps style', () => {
		render(
			<ToastItem
				item={makeItem({variant: 'error'})}
				slotProps={{root: {style: {opacity: '0.9'}}}}
				variantSlotProps={{root: {style: {fontWeight: 'bold'}}}}
			/>,
		);
		const root = screen.getByRole('alert');
		expect(root).toHaveStyle({opacity: '0.9', fontWeight: 'bold'});
	});

	it('variantSlotProps style overrides the same key from slotProps', () => {
		render(
			<ToastItem
				item={makeItem({variant: 'warning'})}
				slotProps={{root: {style: {opacity: '0.5'}}}}
				variantSlotProps={{root: {style: {opacity: '1'}}}}
			/>,
		);
		expect(screen.getByRole('alert')).toHaveStyle({opacity: '1'});
	});
});

describe('CSS class overridability', () => {
	it('root element has no inline backgroundColor by default', () => {
		render(<ToastItem item={makeItem()} />);
		expect(screen.getByRole('status')).not.toHaveStyle({
			backgroundColor: 'var(--toast-bg)',
		});
	});

	it('root element has no inline color by default', () => {
		render(<ToastItem item={makeItem()} />);
		expect(screen.getByRole('status')).not.toHaveStyle({
			color: 'var(--toast-text-color)',
		});
	});

	it('icon span has toast-icon class', () => {
		render(
			<ToastItem
				item={makeItem()}
				resolvedIcon={<svg data-testid="icon" />}
			/>,
		);
		const iconSpan = document.querySelector('span[aria-hidden="true"]');
		expect(iconSpan).toHaveClass('toast-icon');
	});

	it('icon span has no inline color by default', () => {
		render(
			<ToastItem
				item={makeItem()}
				resolvedIcon={<svg data-testid="icon" />}
			/>,
		);
		const iconSpan = document.querySelector('span[aria-hidden="true"]');
		expect(iconSpan).not.toHaveStyle({color: 'var(--toast-icon-color)'});
	});

	it('action button has toast-action-button class', () => {
		render(
			<ToastItem
				item={makeItem({action: {label: 'Retry', onClick: vi.fn()}})}
			/>,
		);
		expect(screen.getByRole('button', {name: 'Retry'})).toHaveClass(
			'toast-action-button',
		);
	});

	it('action button has no inline color by default', () => {
		render(
			<ToastItem
				item={makeItem({action: {label: 'Retry', onClick: vi.fn()}})}
			/>,
		);
		expect(screen.getByRole('button', {name: 'Retry'})).not.toHaveStyle({
			color: 'var(--toast-icon-color)',
		});
	});

	it('consumer style on root is applied as inline style', () => {
		render(
			<ToastItem
				item={makeItem()}
				slotProps={{root: {style: {outlineWidth: '3px'}}}}
			/>,
		);
		expect(screen.getByRole('status')).toHaveStyle({outlineWidth: '3px'});
	});

	it('consumer style on icon is applied as inline style', () => {
		render(
			<ToastItem
				item={makeItem()}
				resolvedIcon={<svg data-testid="icon" />}
				slotProps={{icon: {style: {outlineWidth: '3px'}}}}
			/>,
		);
		const iconSpan = document.querySelector('span[aria-hidden="true"]');
		expect(iconSpan).toHaveStyle({outlineWidth: '3px'});
	});

	it('consumer style on actionButton is applied as inline style', () => {
		render(
			<ToastItem
				item={makeItem({action: {label: 'Retry', onClick: vi.fn()}})}
				slotProps={{actionButton: {style: {outlineWidth: '3px'}}}}
			/>,
		);
		expect(screen.getByRole('button', {name: 'Retry'})).toHaveStyle({
			outlineWidth: '3px',
		});
	});
});

const configuredAxe = configureAxe({
	rules: {'color-contrast': {enabled: false}},
});

describe('accessibility', () => {
	beforeEach(() => {
		vi.useRealTimers();
	});
	afterEach(() => {
		vi.useFakeTimers();
	});

	it('error variant sets role="alert"', () => {
		render(<ToastItem item={makeItem({variant: 'error'})} />);
		expect(screen.getByRole('alert')).toBeInTheDocument();
	});

	it('warning variant sets role="alert"', () => {
		render(<ToastItem item={makeItem({variant: 'warning'})} />);
		expect(screen.getByRole('alert')).toBeInTheDocument();
	});

	it('info variant sets role="status"', () => {
		render(<ToastItem item={makeItem({variant: 'info'})} />);
		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('success variant sets role="status"', () => {
		render(<ToastItem item={makeItem({variant: 'success'})} />);
		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('root element has aria-atomic="true"', () => {
		render(<ToastItem item={makeItem({variant: 'info'})} />);
		expect(screen.getByRole('status')).toHaveAttribute(
			'aria-atomic',
			'true',
		);
	});

	it('icon wrapper has aria-hidden="true"', () => {
		render(
			<ToastItem
				item={makeItem()}
				resolvedIcon={<span data-testid="test-icon" />}
			/>,
		);
		const iconWrapper = document.querySelector('span[aria-hidden="true"]');
		expect(iconWrapper).toBeInTheDocument();
	});

	it('close button SVG is aria-hidden', () => {
		render(<ToastItem item={makeItem()} />);
		const svg = document.querySelector('svg[aria-hidden]');
		expect(svg).toBeInTheDocument();
	});

	it('timer pauses on keyboard focus and resumes on blur', () => {
		vi.useFakeTimers();
		render(<ToastItem item={makeItem({variant: 'info', timeout: 5000})} />);
		const root = screen.getByRole('status');

		act(() => {
			vi.advanceTimersByTime(2000);
		});
		fireEvent.focus(root);

		act(() => {
			vi.advanceTimersByTime(5000);
		});
		expect(toast.dismiss).not.toHaveBeenCalled();

		fireEvent.blur(root);
		act(() => {
			vi.advanceTimersByTime(3000);
		});
		expect(toast.dismiss).toHaveBeenCalledWith('test-id');
	});

	it('error variant passes axe audit', async () => {
		const {container} = render(
			<ol>
				<ToastItem
					item={makeItem({variant: 'error', title: 'Error message'})}
				/>
			</ol>,
		);
		expect(await configuredAxe(container)).toHaveNoViolations();
	});

	it('warning variant passes axe audit', async () => {
		const {container} = render(
			<ol>
				<ToastItem
					item={makeItem({
						variant: 'warning',
						title: 'Warning message',
					})}
				/>
			</ol>,
		);
		expect(await configuredAxe(container)).toHaveNoViolations();
	});

	it('info variant passes axe audit', async () => {
		const {container} = render(
			<ol>
				<ToastItem
					item={makeItem({variant: 'info', title: 'Info message'})}
				/>
			</ol>,
		);
		expect(await configuredAxe(container)).toHaveNoViolations();
	});

	it('success variant passes axe audit', async () => {
		const {container} = render(
			<ol>
				<ToastItem
					item={makeItem({
						variant: 'success',
						title: 'Success message',
					})}
				/>
			</ol>,
		);
		expect(await configuredAxe(container)).toHaveNoViolations();
	});
});
