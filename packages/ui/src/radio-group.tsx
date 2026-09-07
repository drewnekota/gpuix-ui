import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { RadioGroupPrimitive, type Instance } from '@gpuix-ui/primitives'

export interface RadioGroupProps extends Omit<RadioGroupPrimitive.RadioGroupProps, 'style'> {
  style?: Style
}

export const RadioGroup = forwardRef<Instance, RadioGroupProps>(function RadioGroup({ style, ...props }, ref) {
  return <RadioGroupPrimitive.Root {...props} ref={ref} style={{ gap: 12, ...style }} />
})

export interface RadioGroupItemProps extends Omit<RadioGroupPrimitive.RadioGroupItemProps, 'style' | 'children'> {
  style?: Style
  size?: number
}

export const RadioGroupItem = forwardRef<Instance, RadioGroupItemProps>(function RadioGroupItem({ style, size = 16, ...props }, ref) {
  const t = useTheme()
  return (
    <RadioGroupPrimitive.Item
      {...props}
      ref={ref}
      style={(state) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: state.disabled ? 'default' : 'pointer',
        opacity: state.disabled ? 0.5 : 1,
        borderColor: t.colors.input,
        boxShadow: t.shadow.sm,
        backgroundColor: t.appearance === 'dark' ? '#FFFFFF0B' : '#00000000',
        ...style,
      })}
    >
      {(state) =>
        state.checked ? <div style={{ width: size / 2, height: size / 2, borderRadius: size / 4, backgroundColor: t.colors.primary, pointerEvents: 'none' }} /> : null
      }
    </RadioGroupPrimitive.Item>
  )
})
