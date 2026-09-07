/**
 * The floating layer every popover-shaped primitive renders into.
 *
 * GPUI paints `<anchored deferred>` in a later pass, so the content sits over
 * `<virtual-list>` and the rest of the page, snaps inside the window, and
 * occludes what is behind it. A plain `position: absolute` box would not.
 */
import React, { forwardRef, type ReactNode } from 'react'
import { mergeStyle, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from './internal'

export type FloatingSide = 'top' | 'right' | 'bottom' | 'left'
export type FloatingAlign = 'start' | 'center' | 'end'

export interface FloatingContentProps extends Omit<DivProps, 'children'> {
  children?: ReactNode
  side?: FloatingSide
  sideOffset?: number
  align?: FloatingAlign
  alignOffset?: number
  collisionPadding?: number
  /** Paint order among floating layers. Higher paints later. */
  priority?: number
}

/** The wrapper a floating primitive's Root renders, so `anchored` has a box to anchor to. */
export function floatingRootStyle(style?: Style): Style {
  return { display: 'flex', position: 'relative', alignItems: 'start', ...style }
}

export const FloatingLayer = forwardRef<Instance, FloatingContentProps>(function FloatingLayer(
  { side = 'bottom', sideOffset = 0, align = 'start', alignOffset = 0, collisionPadding = 8, priority = 1, children, ...props },
  ref,
) {
  const offset = side === 'top' || side === 'bottom' ? { x: alignOffset, y: 0 } : { x: 0, y: alignOffset }
  return (
    <anchored side={side} align={align} gap={sideOffset} offset={offset} fit="snap" snapMargin={collisionPadding} deferred priority={priority} occlude>
      <div {...props} ref={ref} style={mergeStyle({ backgroundColor: '#1A1A1A' }, props.style)}>
        {children}
      </div>
    </anchored>
  )
})
