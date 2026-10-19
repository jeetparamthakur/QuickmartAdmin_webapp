/**
 * Web design tokens aligned with Quickmart_app/src/constants/theme.ts
 * Keep CSS variables in globals.css in sync when changing these values.
 */

export const colors = {
  primary: "#1B8A3E",
  primaryDark: "#0F5C28",
  primaryLight: "#E6F7EC",
  accent: "#2ECC71",
  accentLight: "#F0FBF4",
  background: "#F4FAF6",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  surfaceSecondary: "#EEF5F0",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  borderSubtle: "#F1F5F9",
  error: "#DC2626",
  success: "#1B8A3E",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
} as const;

/** Font sizes in px — matches customer app typography scale */
export const typography = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: fontWeight.bold },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: fontWeight.bold },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: fontWeight.extraBold },
  body: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.medium },
  label: { fontSize: 14, lineHeight: 18, fontWeight: fontWeight.semiBold },
} as const;
