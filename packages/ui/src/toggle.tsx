import React, { forwardRef, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { useControllableState, type DivProps, type Instance } from '@gpuix-ui/primitives'
import { asText } from './internal'

export interface ToggleProps extends Omit<DivProps, 'style' | 'children'> {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  disabled?: boolean
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md'
  style?: Style
  children?: ReactNode
}

export const Toggle = forwardRef<Instance, ToggleProps>(function Toggle(
  { pressed: pressedProp, defaultPressed = false, onPressedChange, disabled = false, variant = 'default', size = 'md', style, children, onClick, onKeyDown, ...props },
  ref,
) {
  const t = useTheme()
  const [pressed, setPressed] = useControllableState({ value: pressedProp, defaultValue: defaultPressed, onChange: onPressedChange })
  const toggle = () => !disabled && setPressed(!pressed)
  return (
    <div
      {...props}
      ref={ref}
      tabIndex={disabled ? -1 : (props.tabIndex ?? 0)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: size === 'sm' ? 28 : 36,
        paddingLeft: size === 'sm' ? 8 : 12,
        paddingRight: size === 'sm' ? 8 : 12,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: variant === 'outline' ? t.colors.input : '#00000000',
        backgroundColor: pressed ? t.colors.accent : '#00000000',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        hover: disabled ? undefined : { backgroundColor: pressed ? t.colors.accent : t.colors.overlay },
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event)
        toggle()
      }}
      onKeyDown={(event: EventPayload) => {
        onKeyDown?.(event)
        if (event.key === 'enter' || event.key === 'space') toggle()
      }}
    >
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, fontWeight: 500, color: pressed ? t.colors.accentForeground : t.colors.mutedForeground })}
    </div>
  )
})
