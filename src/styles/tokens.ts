// Design tokens for MorphDetect
export const tokens = {
  colors: {
    bg: '#0f1724',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    accent1: '#7ce7ff',
    accent2: '#a084ff',
    success: '#3ee1a7',
    danger: '#ff6b6b',
    warning: '#ffd93d',
    muted: '#9aa4b2',
    text: '#ffffff',
    textMuted: '#b8c5d1',
    textDim: '#6b7785',
  },
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    xxl: '4rem',    // 64px
  },
  borderRadius: {
    sm: '0.625rem',  // 10px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
  },
  typography: {
    h1: '3rem',      // 48px
    h2: '1.75rem',   // 28px
    h3: '1.5rem',    // 24px
    body: '1rem',    // 16px
    small: '0.875rem', // 14px
  },
  animation: {
    duration: '250ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;