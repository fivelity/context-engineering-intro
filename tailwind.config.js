import { skeleton } from '@skeletonlabs/tw-plugin';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/@skeletonlabs/skeleton/**/*.{html,js,svelte,ts}'
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Sensor-specific color schemes
				thermal: {
					50: '#f0f9ff',
					100: '#e0f2fe', 
					500: '#0ea5e9',
					700: '#0369a1',
					900: '#0c4a6e'
				},
				performance: {
					50: '#f0fdf4',
					100: '#dcfce7',
					500: '#22c55e',
					700: '#15803d',
					900: '#14532d'
				},
				critical: {
					50: '#fef2f2',
					100: '#fee2e2',
					500: '#ef4444',
					700: '#dc2626',
					900: '#991b1b'
				}
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'bounce-subtle': 'bounce 2s infinite'
			},
			gridTemplateColumns: {
				'dashboard': 'repeat(auto-fit, minmax(32px, 1fr))'
			}
		}
	},
	plugins: [
		skeleton({
			themes: {
				preset: [
					{ name: 'skeleton', enhancements: true },
					{ name: 'wintry', enhancements: true },
					{ name: 'modern', enhancements: true }
				]
			}
		}),
		forms,
		typography
	]
};