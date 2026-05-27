import eslint from '@eslint/js';
import {defineConfig, globalIgnores} from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['dist/**', 'node_modules/**/*.*']),

	// ESLint rules;
	eslint.configs.recommended,

	// Typescript ESLint rules:
	tseslint.configs.recommended,
	tseslint.configs.strict,
	{
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},

	// Prettier rules:
	eslintPluginPrettierRecommended,

	// React rules:
	react.configs.flat['jsx-runtime'],
	{
		settings: {
			react: {
				version: 'detect',
			},
		},
		files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
		...react.configs.flat.recommended,
		languageOptions: {
			...react.configs.flat.recommended.languageOptions,
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			'react/react-in-jsx-scope': 'off',
		},
	},
	reactHooks.configs.flat.recommended,

	// Simple import sort:
	{
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^react', '^@?\\w'],
						['^(@|components)(/.*|$)'],
						['^\\u0000'],
						['^\\.\\.(?!/?$)', '^\\.\\./?$'],
						['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
						['^.+\\.?(css)$'],
					],
				},
			],
			'simple-import-sort/exports': 'error',
		},
	},

	// Enforce Selvklarts codestyle:
	{
		rules: {
			curly: 'error',
			'prettier/prettier': [
				'error',
				{
					bracketSpacing: false,
					semi: true,
					singleQuote: true,
					plugins: ['prettier-plugin-tailwindcss'],
				},
			],
		},
	},
]);
