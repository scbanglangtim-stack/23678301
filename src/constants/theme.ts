export const LIGHT_COLORS = {
  primary: '#0F766E',
  secondary: '#F59E0B',
  background: '#F0FDFA',
  surface: '#FFFFFF',
  text: '#134E4A',
  textLight: '#5F7A77',
  border: '#CCFBF1',
  error: '#DC2626',
  success: '#16A34A',
} as const;

export const DARK_COLORS = {
  primary: '#0F766E',
  secondary: '#F59E0B',
  background: '#042F2E',
  surface: '#0B4F4A',
  text: '#F0FDFA',
  textLight: '#99F6E4',
  border: '#134E4A',
  error: '#DC2626',
  success: '#16A34A',
} as const;

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  border: string;
  error: string;
  success: string;
};

export const COLORS = LIGHT_COLORS;

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  radiusSm: 6,
  radiusMd: 10,
  radiusLg: 16,
  radiusFull: 999,
} as const;

export const FONTS = {
  h1: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
} as const;

export type FontVariant = keyof typeof FONTS;
