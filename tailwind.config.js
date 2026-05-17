/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#A50034', // SigFlow Indigo
        'primary-dim': 'rgba(0, 131, 192, 0.1)',
        'background-light': '#F9FAFB',
        'surface-white': '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'border-subtle': '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#F43F5E', // status-error
        info: '#3B82F6',
      },
      borderRadius: {
        'sm': '1px',
        'DEFAULT': '2px',
        'md': '2px',
        'lg': '4px',
        'xl': '6px',
        '2xl': '8px',
      },
      maxWidth: {
        'container': '84rem',
      },
      spacing: {
        'section': '5rem',
      }
    },
  },
  plugins: [],
}
