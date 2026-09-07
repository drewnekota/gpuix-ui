/**
 * Theme tokens. The same names as shadcn's CSS variables, as plain values,
 * because GPUI has no cascade. Every component reads the theme from context
 * and every `<text>` sets a colour from it: GPUI does not inherit `color`.
 */
import { createContext, useContext, type ReactNode } from 'react'
import type { JSX } from '@gpuix/react/jsx-runtime'
import type { BoxShadow } from './types'

/** The native theme type for `<markdown>`, `<code>`, `<diff>`, `<input>`. Not exported by @gpuix/react, so derived from JSX. */
export type GpuixTheme = NonNullable<JSX.IntrinsicElements['markdown']['theme']>

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  success: string
  warning: string
  border: string
  input: string
  ring: string
  /** Translucent hover wash, for rows and ghost buttons. */
  overlay: string
  /** Stronger wash, for pressed and selected rows. */
  overlayStrong: string
  sidebar: string
  sidebarForeground: string
  sidebarBorder: string
  /** Text selection wash. */
  selection: string
  /** Syntax + code surface for `<code>` and `<markdown>`. */
  codeText: string
  codeWash: string
}

export interface ThemeRadius {
  sm: number
  md: number
  lg: number
  xl: number
  full: number
}

export interface ThemeFont {
  sans: string
  mono: string
  size: { xs: number; sm: number; base: number; lg: number; xl: number; '2xl': number }
  lineHeight: { xs: number; sm: number; base: number; lg: number; xl: number; '2xl': number }
}

export interface Theme {
  name: string
  appearance: 'light' | 'dark'
  colors: ThemeColors
  radius: ThemeRadius
  font: ThemeFont
  shadow: { sm: BoxShadow; md: BoxShadow; lg: BoxShadow }
  /** Base spacing unit. Components use multiples of it. */
  space: number
}

function platformSans(): string {
  if (typeof process === 'undefined') return 'IBM Plex Sans'
  if (process.platform === 'darwin') return 'Helvetica'
  if (process.platform === 'win32') return 'Segoe UI'
  return 'Noto Sans'
}

function platformMono(): string {
  if (typeof process === 'undefined') return 'Lilex'
  if (process.platform === 'darwin') return 'Menlo'
  if (process.platform === 'win32') return 'Consolas'
  return 'DejaVu Sans Mono'
}

const font: ThemeFont = {
  sans: platformSans(),
  mono: platformMono(),
  size: { xs: 11, sm: 12.5, base: 14, lg: 16, xl: 18, '2xl': 22 },
  lineHeight: { xs: 14, sm: 16, base: 20, lg: 22, xl: 26, '2xl': 30 },
}

const radius: ThemeRadius = { sm: 4, md: 6, lg: 8, xl: 12, full: 999 }

const shadowDark = {
  sm: { offsetX: 0, offsetY: 1, blurRadius: 2, spreadRadius: 0, color: '#00000066' },
  md: { offsetX: 0, offsetY: 4, blurRadius: 12, spreadRadius: -2, color: '#00000080' },
  lg: { offsetX: 0, offsetY: 12, blurRadius: 32, spreadRadius: -6, color: '#000000A0' },
}
const shadowLight = {
  sm: { offsetX: 0, offsetY: 1, blurRadius: 2, spreadRadius: 0, color: '#0000001A' },
  md: { offsetX: 0, offsetY: 4, blurRadius: 12, spreadRadius: -2, color: '#00000026' },
  lg: { offsetX: 0, offsetY: 12, blurRadius: 32, spreadRadius: -6, color: '#00000033' },
}

export const darkTheme: Theme = {
  name: 'dark',
  appearance: 'dark',
  colors: {
    background: '#0A0A0A',
    foreground: '#FAFAFA',
    card: '#141414',
    cardForeground: '#FAFAFA',
    popover: '#1A1A1A',
    popoverForeground: '#FAFAFA',
    primary: '#FAFAFA',
    primaryForeground: '#171717',
    secondary: '#262626',
    secondaryForeground: '#FAFAFA',
    muted: '#1F1F1F',
    mutedForeground: '#A3A3A3',
    accent: '#262626',
    accentForeground: '#FAFAFA',
    destructive: '#EF4444',
    destructiveForeground: '#FAFAFA',
    success: '#22C55E',
    warning: '#F59E0B',
    border: '#FFFFFF1A',
    input: '#FFFFFF26',
    ring: '#A3A3A3',
    overlay: '#FFFFFF0D',
    overlayStrong: '#FFFFFF1A',
    sidebar: '#0F0F0F',
    sidebarForeground: '#D4D4D4',
    sidebarBorder: '#FFFFFF14',
    selection: '#FAFAFA40',
    codeText: '#E5E5E5',
    codeWash: '#FFFFFF14',
  },
  radius,
  font,
  shadow: shadowDark,
  space: 4,
}

export const lightTheme: Theme = {
  name: 'light',
  appearance: 'light',
  colors: {
    background: '#FFFFFF',
    foreground: '#0A0A0A',
    card: '#FFFFFF',
    cardForeground: '#0A0A0A',
    popover: '#FFFFFF',
    popoverForeground: '#0A0A0A',
    primary: '#171717',
    primaryForeground: '#FAFAFA',
    secondary: '#F5F5F5',
    secondaryForeground: '#171717',
    muted: '#F5F5F5',
    mutedForeground: '#737373',
    accent: '#F5F5F5',
    accentForeground: '#171717',
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',
    success: '#16A34A',
    warning: '#D97706',
    border: '#E5E5E5',
    input: '#E5E5E5',
    ring: '#A3A3A3',
    overlay: '#0000000A',
    overlayStrong: '#00000014',
    sidebar: '#FAFAFA',
    sidebarForeground: '#404040',
    sidebarBorder: '#E5E5E5',
    selection: '#17171740',
    codeText: '#171717',
    codeWash: '#00000010',
  },
  radius,
  font,
  shadow: shadowLight,
  space: 4,
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

/** Derive a theme from a base. Nested objects merge, so one colour can change. */
export function createTheme(base: Theme, overrides: DeepPartial<Theme>): Theme {
  return {
    ...base,
    ...overrides,
    colors: { ...base.colors, ...(overrides.colors ?? {}) },
    radius: { ...base.radius, ...(overrides.radius ?? {}) },
    font: {
      ...base.font,
      ...(overrides.font ?? {}),
      size: { ...base.font.size, ...(overrides.font?.size ?? {}) },
      lineHeight: { ...base.font.lineHeight, ...(overrides.font?.lineHeight ?? {}) },
    },
    shadow: { ...base.shadow, ...(overrides.shadow ?? {}) } as Theme['shadow'],
  } as Theme
}

/** The native theme for `<markdown>`, `<code>`, `<diff>`, `<input>`, `<textarea>`. */
export function toGpuixTheme(theme: Theme): GpuixTheme {
  const { colors, font } = theme
  return {
    appearance: theme.appearance,
    bg: colors.background,
    border: colors.border,
    text: colors.foreground,
    textMuted: colors.mutedForeground,
    textFaint: colors.mutedForeground,
    textDim: colors.mutedForeground,
    accent: colors.primary,
    caret: colors.foreground,
    codeText: colors.codeText,
    codeWash: colors.codeWash,
    fontSans: font.sans,
    fontMono: font.mono,
    metrics: {
      mdTextSize: font.size.base,
      mdLineHeight: font.lineHeight.base + 2,
      mdBlockGap: 12,
      mdHeadingSizes: [font.size['2xl'], font.size.xl, font.size.lg, font.size.base],
      mdHeadingLineHeights: [font.lineHeight['2xl'], font.lineHeight.xl, font.lineHeight.lg, font.lineHeight.base],
      codeTextSize: font.size.sm,
      codeLineHeight: font.lineHeight.base,
    },
  }
}

const ThemeContext = createContext<Theme>(darkTheme)

export function ThemeProvider({ theme, children }: { theme: Theme; children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme(): Theme {
  return useContext(ThemeContext)
}
