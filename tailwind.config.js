/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				bg: 'var(--background-color)',
				textDark: 'var(--text-dark)',
				textLight: '#B8B8AD',
				primaryOrange: '#FB651F',
				borderLight: '#EEEEE2',
				borderDark: 'var(--border-dark)',
				borderDarkHover: 'var(--border-dark-hover)',
				blue: 'var(--blue)',
				dangerLight: '#FF6B6B'
			}
		}
	},
	plugins: []
};
