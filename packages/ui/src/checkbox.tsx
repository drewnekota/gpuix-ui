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
        borderRadius: 4,
        borderWidth: 1,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: state.disabled ? 'default' : 'pointer',
        opacity: state.disabled ? 0.5 : 1,
        borderColor: state.checked ? t.colors.primary : t.colors.input,
        boxShadow: t.shadow.sm,
        backgroundColor: state.checked ? t.colors.primary : t.appearance === 'dark' ? '#FFFFFF0B' : '#00000000',
        ...style,
      })}
    >
      {(state) =>
        state.checked ? (
          <Icon name={state.checked === 'indeterminate' ? 'minus' : 'check'} size={size - 2} color={t.colors.primaryForeground} />
        ) : null
      }
    </CheckboxPrimitive.Root>
  )
})
