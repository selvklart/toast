import React from 'react';
import {toHaveNoViolations} from 'jest-axe';
import {vi} from 'vitest';

import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

interface MotionDivProps extends React.HTMLAttributes<HTMLDivElement> {
	layout?: unknown;
	initial?: unknown;
	animate?: unknown;
	exit?: unknown;
	transition?: unknown;
}

vi.mock('motion/react', () => ({
	motion: {
		div: ({
			children,
			layout: _layout,
			initial: _initial,
			animate: _animate,
			exit: _exit,
			transition: _transition,
			...props
		}: MotionDivProps) => React.createElement('div', props, children),
	},
	AnimatePresence: ({children}: {children?: React.ReactNode}) =>
		React.createElement(React.Fragment, null, children),
}));
