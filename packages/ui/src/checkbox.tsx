import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { CheckboxPrimitive, type Instance } from '@gpuix-ui/primitives'
import { Icon } from './icons'

export interface CheckboxProps extends Omit<CheckboxPrimitive.CheckboxProps, 'style' | 'children'> {
  style?: Style
  size?: number
}

export const Checkbox = forwardRef<Instance, CheckboxProps>(function Checkbox({ style, size = 16, ...props }, ref) {
  const t = useTheme()
  return (
    <CheckboxPrimitive.Root
      {...props}
      ref={ref}
      style={(state) => ({
        width: size,
        height: size,
        borderRadius: t.radius.sm,
        borderWidth: 1,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: state.disabled ? 'default' : 'pointer',
        opacity: state.disabled ? 0.5 : 1,
        borderColor: state.checked ? t.colors.primary : t.colors.input,
        backgroundColor: state.checked ? t.colors.primary : t.colors.background,
        ...style,
      })}
    >
      {(state) =>
        state.checked ? (
          <Icon name={state.checked === 'indeterminate' ? 'minus' : 'check'} size={size - 4} color={t.colors.primaryForeground} />
        ) : null
      }
    </CheckboxPrimitive.Root>
  )
})
