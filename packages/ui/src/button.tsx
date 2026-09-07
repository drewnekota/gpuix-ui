import React, { forwardRef, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { sv, sx, useTheme, useVariants, withAlpha, type Style, type Theme, type VariantProps } from '@gpuix-ui/core'
import { renderSlot, type DivProps, type Instance } from '@gpuix-ui/primitives'
import { asText } from './internal'

export const buttonVariants = (t: Theme) =>
  sv({
    base: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      gap: 8,
      borderRadius: t.radius.md,
      cursor: 'pointer',
      userSelect: 'none',
      borderWidth: 1,
      borderColor: '#00000000',
    },
    variants: {
      variant: {
        default: {
          backgroundColor: t.colors.primary,
          hover: { backgroundColor: withAlpha(t.colors.primary, 0.9) },
          active: { backgroundColor: withAlpha(t.colors.primary, 0.8) },
        },
        secondary: {
          backgroundColor: t.colors.secondary,
          hover: { backgroundColor: withAlpha(t.colors.secondary, 0.8) },
          active: { backgroundColor: t.colors.overlayStrong },
        },
        outline: {
          backgroundColor: t.colors.background,
          borderColor: t.colors.input,
          hover: { backgroundColor: t.colors.accent },
          active: { backgroundColor: t.colors.overlayStrong },
        },
        ghost: {
          hover: { backgroundColor: t.colors.accent },
          active: { backgroundColor: t.colors.overlayStrong },
        },
        destructive: {
          backgroundColor: t.colors.destructive,
          hover: { backgroundColor: withAlpha(t.colors.destructive, 0.9) },
          active: { backgroundColor: withAlpha(t.colors.destructive, 0.8) },
        },
        link: { paddingLeft: 0, paddingRight: 0 },
      },
      size: {
        xs: { height: 24, paddingLeft: 8, paddingRight: 8, gap: 4, borderRadius: t.radius.sm },
        sm: { height: 32, paddingLeft: 12, paddingRight: 12, gap: 6 },
        md: { height: 36, paddingLeft: 16, paddingRight: 16 },
        lg: { height: 40, paddingLeft: 24, paddingRight: 24 },
        icon: { width: 36, height: 36 },
        iconSm: { width: 32, height: 32 },
        iconXs: { width: 24, height: 24, borderRadius: t.radius.sm },
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  })

export function buttonTextColor(t: Theme, variant: VariantProps<ReturnType<typeof buttonVariants>>['variant']): string {
  switch (variant) {
    case 'secondary':
      return t.colors.secondaryForeground
    case 'outline':
    case 'ghost':
      return t.colors.foreground
    case 'destructive':
      return t.colors.destructiveForeground
    case 'link':
      return t.colors.primary
    default:
      return t.colors.primaryForeground
  }
}

export interface ButtonProps extends Omit<DivProps, 'style' | 'children'>, VariantProps<ReturnType<typeof buttonVariants>> {
  style?: Style
  children?: ReactNode
  disabled?: boolean
  /** Merge the button's behaviour into the single child element instead of rendering a div. */
  asChild?: boolean
}

export const Button = forwardRef<Instance, ButtonProps>(function Button(
  { variant = 'default', size = 'md', disabled = false, asChild, style, children, onClick, onKeyDown, ...props },
  ref,
) {
  const t = useTheme()
  const variants = useVariants(buttonVariants)
  const color = buttonTextColor(t, variant)
  const fontSize = size === 'xs' || size === 'iconXs' ? t.font.size.xs : size === 'sm' || size === 'iconSm' ? t.font.size.sm : t.font.size.base
  let computed = variants({ variant, size, style })
  if (disabled) computed = { ...computed, opacity: 0.5, cursor: 'default', hover: undefined, active: undefined }
  const textStyle: Style = {
    fontFamily: t.font.sans,
    fontSize,
    lineHeight: fontSize + 6,
    fontWeight: 500,
    color,
    whiteSpace: 'nowrap',
  }
  return renderSlot({
    asChild,
    children: asText(children, textStyle),
    ref,
    props: {
      ...props,
      tabIndex: disabled ? -1 : (props.tabIndex ?? 0),
      style: computed,
      onClick: (event: EventPayload) => {
        if (disabled) return
        onClick?.(event)
      },
      onKeyDown: (event: EventPayload) => {
        onKeyDown?.(event)
        if (!disabled && (event.key === 'enter' || event.key === 'space')) onClick?.(event)
      },
    },
  })
})

/** The text colour a child icon should use inside a button of this variant. */
export function useButtonForeground(variant: ButtonProps['variant'] = 'default'): string {
  const t = useTheme()
  return buttonTextColor(t, variant)
}

export { sx as mergeButtonStyle }
