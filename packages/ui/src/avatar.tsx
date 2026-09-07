import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'

export interface AvatarProps extends Omit<DivProps, 'style' | 'children'> {
  src?: string
  /** Text shown when there is no `src`, usually initials. */
  fallback?: string
  size?: number
  style?: Style
  /** Fallback background. Defaults to the muted surface. */
  color?: string
}

/** "Ada Lovelace" -> "AL", "You" -> "Y". */
function initials(fallback: string | undefined): string {
  const words = (fallback ?? '?').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0]!.slice(0, 1).toUpperCase()
  return (words[0]!.slice(0, 1) + words[words.length - 1]!.slice(0, 1)).toUpperCase()
}

export const Avatar = forwardRef<Instance, AvatarProps>(function Avatar({ src, fallback, size = 32, style, color, ...props }, ref) {
  const t = useTheme()
  return (
    <div
      {...props}
      ref={ref}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color ?? t.colors.muted,
        ...style,
      }}
    >
      {src ? (
        <img src={src} objectFit="cover" style={{ width: size, height: size }} />
      ) : (
        <text style={{ fontFamily: t.font.sans, fontSize: Math.round(size * 0.4), fontWeight: 600, color: t.colors.foreground }}>
          {initials(fallback)}
        </text>
      )}
    </div>
  )
})
