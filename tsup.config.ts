import {defineConfig} from 'tsup';

export default defineConfig({
	banner: {
		js: '"use client";',
	},
	entry: ['src/index.ts'],
	format: ['esm'],
	dts: true,
	clean: true,
	external: ['react', 'react-dom', 'motion', 'motion/react'],
	jsx: 'react-jsx',
});
