import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'

export interface ProgressProps extends Omit<DivProps, 'style'> {
  /** 0 to 100. */
  value?: number
  style?: Style
  color?: string
}

export const Progress = forwardRef<Instance, ProgressProps>(function Progress({ value = 0, style, color, ...props }, ref) {
  const t = useTheme()
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      {...props}
      ref={ref}
      style={{ height: 8, width: '100%', borderRadius: t.radius.full, backgroundColor: t.colors.secondary, overflow: 'hidden', display: 'flex', ...style }}
    >
      <div style={{ height: '100%', width: `${clamped}%`, borderRadius: t.radius.full, backgroundColor: color ?? t.colors.primary, pointerEvents: 'none' }} />
    </div>
  )
})
