import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'

export interface SkeletonProps extends Omit<DivProps, 'style'> {
  style?: Style
}

export const Skeleton = forwardRef<Instance, SkeletonProps>(function Skeleton({ style, ...props }, ref) {
  const t = useTheme()
  return <div {...props} ref={ref} style={{ height: 16, width: '100%', borderRadius: t.radius.md, backgroundColor: t.colors.accent, ...style }} />
})
