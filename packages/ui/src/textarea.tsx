import React, { forwardRef } from 'react'
import type { EventPayload } from '@gpuix/react'
import type { JSX } from '@gpuix/react/jsx-runtime'
import { toGpuixTheme, useTheme, type Style } from '@gpuix-ui/core'
import type { Instance } from '@gpuix-ui/primitives'
import { useFocusState } from './internal'

type HostTextareaProps = JSX.IntrinsicElements['textarea']

export interface TextareaProps extends Omit<HostTextareaProps, 'style' | 'onChange' | 'children'> {
  style?: Style
  textareaStyle?: Style
  onValueChange?: (value: string) => void
  onChange?: (event: EventPayload) => void
  disabled?: boolean
  /** Paint no border or background, for a composer that supplies its own frame. */
  unstyled?: boolean
  wrapperTestId?: string
}

export const Textarea = forwardRef<Instance, TextareaProps>(function Textarea(
  { style, textareaStyle, onValueChange, onChange, disabled = false, readOnly, unstyled = false, onFocus, onBlur, wrapperTestId, theme, minRows = 2, maxRows = 8, ...props },
  ref,
) {
  const t = useTheme()
  const focus = useFocusState({ onFocus, onBlur })
  return (
    <div
      testId={wrapperTestId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        borderRadius: t.radius.md,
        borderWidth: unstyled ? 0 : 1,
        borderColor: focus.focused ? t.colors.ring : t.colors.input,
        backgroundColor: unstyled ? '#00000000' : t.colors.background,
        paddingLeft: unstyled ? 0 : 12,
        paddingRight: unstyled ? 0 : 12,
        paddingTop: unstyled ? 0 : 8,
        paddingBottom: unstyled ? 0 : 8,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <textarea
        {...props}
        ref={ref}
        minRows={minRows}
        maxRows={maxRows}
        readOnly={readOnly || disabled}
        theme={theme ?? toGpuixTheme(t)}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        onChange={(event) => {
          onChange?.(event)
          onValueChange?.(event.value ?? '')
        }}
        style={{
          width: '100%',
          minWidth: 0,
          fontFamily: t.font.sans,
          fontSize: t.font.size.base,
          lineHeight: t.font.lineHeight.base,
          color: t.colors.foreground,
          backgroundColor: '#00000000',
          borderWidth: 0,
          ...textareaStyle,
        }}
      />
    </div>
  )
})
