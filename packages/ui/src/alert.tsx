import React, { createContext, useContext, forwardRef, type ReactNode } from 'react'
import { sv, useTheme, useVariants, withAlpha, type Style, type Theme, type VariantProps } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'
import { Icon, type IconName } from './icons'
import { Text, type TextProps } from './text'

const AlertTone = createContext<'default' | 'destructive' | 'warning'>('default')

export const alertVariants = (t: Theme) =>
  sv({
    base: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      width: '100%',
      padding: 16,
      borderRadius: t.radius.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
    variants: {
      variant: {
        default: {},
        destructive: {},
        warning: { borderColor: withAlpha(t.colors.warning, 0.5), backgroundColor: withAlpha(t.colors.warning, 0.08) },
      },
    },
    defaultVariants: { variant: 'default' },
  })

export interface AlertProps extends Omit<DivProps, 'style'>, VariantProps<ReturnType<typeof alertVariants>> {
  style?: Style
  icon?: IconName | null
  children?: ReactNode
}

export const Alert = forwardRef<Instance, AlertProps>(function Alert({ variant = 'default', icon, style, children, ...props }, ref) {
  const t = useTheme()
  const variants = useVariants(alertVariants)
  const color = variant === 'destructive' ? t.colors.destructive : variant === 'warning' ? t.colors.warning : t.colors.foreground
  const iconName = icon === null ? null : (icon ?? (variant === 'default' ? 'info' : 'alertTriangle'))
  return (
    <AlertTone.Provider value={variant ?? 'default'}><div {...props} ref={ref} style={variants({ variant, style })}>
      {iconName ? <Icon name={iconName} size={16} color={color} style={{ marginTop: 2 }} /> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexGrow: 1, minWidth: 0 }}>{children}</div>
    </div></AlertTone.Provider>
  )
})

export const AlertTitle = forwardRef<Instance, TextProps>(function AlertTitle(props, ref) {
  const t = useTheme()
  const tone = useContext(AlertTone)
  return <Text size="sm" weight="medium" {...props} style={{ color: tone === 'destructive' ? t.colors.destructive : tone === 'warning' ? t.colors.warning : t.colors.foreground, ...props.style }} ref={ref} />
})

export const AlertDescription = forwardRef<Instance, TextProps>(function AlertDescription(props, ref) {
  const t = useTheme()
  const tone = useContext(AlertTone)
  return <Text size="sm" tone="muted" {...props} style={{ color: tone === 'destructive' ? t.colors.destructive : tone === 'warning' ? t.colors.warning : t.colors.mutedForeground, ...props.style }} ref={ref} />
})
