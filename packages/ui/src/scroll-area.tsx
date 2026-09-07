/**
 * A native scroll container. GPUI allows one vertical scroller per screen:
 * nothing inside a ScrollArea may scroll vertically. Use `<virtual-list>`
 * directly for long collections.
 */
import React, { forwardRef } from 'react'
import type { Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'

export interface ScrollAreaProps extends Omit<DivProps, 'style'> {
  style?: Style
  orientation?: 'vertical' | 'horizontal' | 'both'
}

export const ScrollArea = forwardRef<Instance, ScrollAreaProps>(function ScrollArea({ style, orientation = 'vertical', ...props }, ref) {
  const overflow = orientation === 'both' ? { overflow: 'scroll' } : orientation === 'horizontal' ? { overflowX: 'scroll' } : { overflowY: 'scroll' }
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, ...overflow, ...style }} />
})
