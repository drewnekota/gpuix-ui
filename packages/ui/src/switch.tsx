import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { SwitchPrimitive, type Instance } from '@gpuix-ui/primitives'

export interface SwitchProps extends Omit<SwitchPrimitive.SwitchProps, 'style' | 'children'> {
  style?: Style
  size?: 'sm' | 'md'
}

export const Switch = forwardRef<Instance, SwitchProps>(function Switch({ style, size = 'md', ...props }, ref) {
  const t = useTheme()
  const width = size === 'sm' ? 24 : 32
  const height = size === 'sm' ? 14 : 18.4
  const thumb = size === 'sm' ? 12 : 16
  return (
    <SwitchPrimitive.Root
      {...props}
      ref={ref}
      style={(state) => ({
        width,
        height,
        borderRadius: height / 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 1,
        cursor: state.disabled ? 'default' : 'pointer',
        opacity: state.disabled ? 0.5 : 1,
        backgroundColor: state.checked ? t.colors.primary : t.colors.input,
        ...style,
      })}
    >
      <SwitchPrimitive.Thumb
        style={(state) => ({
          width: thumb,
          height: thumb,
          borderRadius: thumb / 2,
          marginLeft: state.checked ? width - thumb - 2 : 0,
          backgroundColor: t.appearance === 'dark' ? (state.checked ? t.colors.primaryForeground : t.colors.foreground) : t.colors.background,
          boxShadow: t.shadow.sm,
          pointerEvents: 'none',
        })}
      />
    </SwitchPrimitive.Root>
  )
})
