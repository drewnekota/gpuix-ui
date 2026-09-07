/** Helpers shared by the styled components. */
import React, { useState, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import type { Style } from '@gpuix-ui/core'

/**
 * GPUI does not inherit `color`, so a bare string child would paint black.
 * Wrap string and number children in a `<text>` carrying the given style;
 * pass elements through untouched.
 */
export function asText(children: ReactNode, style: Style): ReactNode {
  if (children == null || typeof children === 'boolean') return null
  if (typeof children === 'string' || typeof children === 'number') return <text style={style}>{String(children)}</text>
  if (Array.isArray(children) && children.every((child) => typeof child === 'string' || typeof child === 'number')) {
    return <text style={style}>{children.join('')}</text>
  }
  return children
}

/** Track native focus on an element, for a focus ring. */
export function useFocusState(handlers: { onFocus?: (event: EventPayload) => void; onBlur?: (event: EventPayload) => void } = {}) {
  const [focused, setFocused] = useState(false)
  return {
    focused,
    onFocus: (event: EventPayload) => {
      handlers.onFocus?.(event)
      setFocused(true)
    },
    onBlur: (event: EventPayload) => {
      handlers.onBlur?.(event)
      setFocused(false)
    },
  }
}

/** Track hover in React state, for components that render different children on hover. */
export function useHoverState() {
  const [hovered, setHovered] = useState(false)
  return { hovered, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
}
