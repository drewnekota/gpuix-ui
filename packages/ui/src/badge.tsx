import React, { forwardRef, type ReactNode } from 'react'
import { sv, useTheme, useVariants, withAlpha, type Style, type Theme, type VariantProps } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'
import { asText } from './internal'

export const badgeVariants = (t: Theme) =>
  sv({
    base: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      height: 22,
      paddingLeft: 8,
      paddingRight: 8,
      borderRadius: t.radius.full,
      borderWidth: 1,
      borderColor: '#00000000',
      flexShrink: 0,
    },
    variants: {
      variant: {
        default: { backgroundColor: t.colors.primary },
        secondary: { backgroundColor: t.colors.secondary },
        outline: { borderColor: t.colors.border },
        destructive: { backgroundColor: t.appearance === 'dark' ? withAlpha(t.colors.destructive, 0.6) : t.colors.destructive },
        success: { backgroundColor: withAlpha(t.colors.success, 0.18), borderColor: withAlpha(t.colors.success, 0.4) },
      },
    },
    defaultVariants: { variant: 'default' },
  })

export interface BadgeProps extends Omit<DivProps, 'style' | 'children'>, VariantProps<ReturnType<typeof badgeVariants>> {
  style?: Style
  children?: ReactNode
}

export const Badge = forwardRef<Instance, BadgeProps>(function Badge({ variant = 'default', style, children, ...props }, ref) {
  const t = useTheme()
  const variants = useVariants(badgeVariants)
  const color =
    variant === 'default'
      ? t.colors.primaryForeground
      : variant === 'destructive'
        ? t.colors.destructiveForeground
        : variant === 'success'
          ? t.colors.success
          : t.colors.foreground
  return (
    <div {...props} ref={ref} style={variants({ variant, style })}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.xs, lineHeight: t.font.lineHeight.xs, fontWeight: 500, color, whiteSpace: 'nowrap' })}
    </div>
  )
})
