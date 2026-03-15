export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', light: '#3B82F6', dark: '#1D4ED8' },
        sidebar: '#1E293B',
        bg: '#F8FAFC',
        status: {
          pending: '#F59E0B', resolved: '#10B981',
          urgent: '#EF4444', progress: '#8B5CF6',
        },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
      boxShadow: {
        card:  '0 1px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        hover: '0 8px 24px rgba(37,99,235,0.15)',
        modal: '0 20px 60px rgba(0,0,0,0.18)',
      },
      screens: {
        xs: '380px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        sidebar: '240px',
        'sidebar-sm': '72px',
      },
    },
  },
  plugins: [],
};
