import React, { forwardRef, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import type { JSX } from '@gpuix/react/jsx-runtime'
import { sv, toGpuixTheme, useTheme, withAlpha, useVariants, type Style, type Theme, type VariantProps } from '@gpuix-ui/core'
import type { Instance } from '@gpuix-ui/primitives'
import { useFocusState } from './internal'

type HostInputProps = JSX.IntrinsicElements['input']

export const inputVariants = (t: Theme) =>
  sv({
    base: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      minWidth: 0,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.input,
      backgroundColor: t.appearance === 'dark' ? '#151515' : t.colors.background,
      boxShadow: t.shadow.sm,
      paddingLeft: 12,
      paddingRight: 12,
    },
    variants: {
      size: {
        sm: { height: 32, paddingLeft: 10, paddingRight: 10 },
        md: { height: 36 },
        lg: { height: 40 },
      },
    },
    defaultVariants: { size: 'md' },
  })

export interface InputProps extends Omit<HostInputProps, 'style' | 'onChange' | 'children'>, VariantProps<ReturnType<typeof inputVariants>> {
  /** Wrapper style. Use `inputStyle` for the native editor itself. */
  style?: Style
  inputStyle?: Style
  onValueChange?: (value: string) => void
  onChange?: (event: EventPayload) => void
  disabled?: boolean
  /** Slots on either side of the editor, for an icon or a button. */
  leading?: ReactNode
  trailing?: ReactNode
  /** Locator id for the wrapper. The native input gets `testId`. */
  wrapperTestId?: string
}

export const Input = forwardRef<Instance, InputProps>(function Input(
  { size, style, inputStyle, onValueChange, onChange, disabled = false, readOnly, leading, trailing, onFocus, onBlur, wrapperTestId, theme, ...props },
  ref,
) {
  const t = useTheme()
  const variants = useVariants(inputVariants)
  const focus = useFocusState({ onFocus, onBlur })
  const fontSize = size === 'sm' ? t.font.size.sm : t.font.size.sm
  return (
    <div
      testId={wrapperTestId}
      style={variants({
        size,
        style: {
          borderColor: focus.focused ? t.colors.ring : t.colors.input,
          opacity: disabled ? 0.5 : 1,
          boxShadow: focus.focused ? { offsetX: 0, offsetY: 0, blurRadius: 0, spreadRadius: 3, color: withAlpha(t.colors.ring, 0.5) } : t.shadow.sm,
          ...style,
        },
      })}
    >
      {leading}
      <input
        {...props}
        ref={ref}
        readOnly={readOnly || disabled}
        theme={theme ?? toGpuixTheme(t)}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        onChange={(event) => {
          onChange?.(event)
          onValueChange?.(event.value ?? '')
        }}
        style={{
          flexGrow: 1,
          minWidth: 0,
          fontFamily: t.font.sans,
          fontSize,
          color: t.colors.foreground,
          ...inputStyle,
        }}
      />
      {trailing}
    </div>
  )
})
