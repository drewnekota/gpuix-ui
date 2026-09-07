import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'
import { asText } from './internal'

export interface KbdProps extends Omit<DivProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
}

export const Kbd = forwardRef<Instance, KbdProps>(function Kbd({ style, children, ...props }, ref) {
  const t = useTheme()
  return (
    <div
      {...props}
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 20,
        minWidth: 20,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: t.radius.sm,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.muted,
        flexShrink: 0,
        ...style,
      }}
    >
      {asText(children, { fontFamily: t.font.mono, fontSize: t.font.size.xs, lineHeight: t.font.lineHeight.xs, color: t.colors.mutedForeground })}
    </div>
  )
})
