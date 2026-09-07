import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'

export interface SeparatorProps extends Omit<DivProps, 'style'> {
  orientation?: 'horizontal' | 'vertical'
  style?: Style
}

export const Separator = forwardRef<Instance, SeparatorProps>(function Separator({ orientation = 'horizontal', style, ...props }, ref) {
  const t = useTheme()
  const size = orientation === 'horizontal' ? { height: 1, width: '100%' } : { width: 1, height: '100%' }
  return <div {...props} ref={ref} style={{ ...size, flexShrink: 0, backgroundColor: t.colors.border, ...style }} />
})
