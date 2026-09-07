/**
 * The typographic primitive. Every other component renders its strings through
 * this so font, size, line height, and colour always come from the theme.
 */
import React, { forwardRef } from 'react'
import { sv, sx, useTheme, useVariants, type Style, type Theme, type VariantProps } from '@gpuix-ui/core'
import type { Instance, TextProps as HostTextProps } from '@gpuix-ui/primitives'

export const textVariants = (t: Theme) =>
  sv({
    base: { fontFamily: t.font.sans, fontSize: t.font.size.base, lineHeight: t.font.lineHeight.base, color: t.colors.foreground },
    variants: {
      size: {
        xs: { fontSize: t.font.size.xs, lineHeight: t.font.lineHeight.xs },
        sm: { fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.sm },
        base: { fontSize: t.font.size.base, lineHeight: t.font.lineHeight.base },
        lg: { fontSize: t.font.size.lg, lineHeight: t.font.lineHeight.lg },
        xl: { fontSize: t.font.size.xl, lineHeight: t.font.lineHeight.xl },
        '2xl': { fontSize: t.font.size['2xl'], lineHeight: t.font.lineHeight['2xl'] },
      },
      tone: {
        default: { color: t.colors.foreground },
        muted: { color: t.colors.mutedForeground },
        primary: { color: t.colors.primary },
        destructive: { color: t.colors.destructive },
        success: { color: t.colors.success },
        inherit: {},
      },
      weight: {
        normal: { fontWeight: 400 },
        medium: { fontWeight: 500 },
        semibold: { fontWeight: 600 },
        bold: { fontWeight: 700 },
      },
    },
    defaultVariants: { size: 'base', tone: 'default', weight: 'normal' },
  })

export interface TextProps extends Omit<HostTextProps, 'style'>, VariantProps<ReturnType<typeof textVariants>> {
  style?: Style
  /** Use the monospace family. */
  mono?: boolean
  /** Single line with an ellipsis. The element needs a bounded width. */
  truncate?: boolean
}

export const Text = forwardRef<Instance, TextProps>(function Text({ size, tone, weight, mono, truncate, style, ...props }, ref) {
  const t = useTheme()
  const variants = useVariants(textVariants)
  const extra: Style = {
    ...(mono ? { fontFamily: t.font.mono } : {}),
    ...(truncate ? { whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 } : {}),
  }
  return <text {...props} ref={ref} style={variants({ size, tone, weight, style: sx(extra, style) })} />
})

/** The base text style for the current theme, for components that paint their own `<text>`. */
export function useTextStyle(overrides?: Style): Style {
  const t = useTheme()
  return sx({ fontFamily: t.font.sans, fontSize: t.font.size.base, lineHeight: t.font.lineHeight.base, color: t.colors.foreground }, overrides)
}
