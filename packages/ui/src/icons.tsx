/**
 * The few icons the components need, as inline SVG source so a copied
 * component file has no asset dependency. Paths are from Lucide (ISC).
 * `stroke="#000"` is required: GPUI tints through `style.color`, not
 * `currentColor`.
 */
import React from 'react'
import type { Style } from '@gpuix-ui/core'

function lucide(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

export const icons = {
  check: lucide('<path d="M20 6 9 17l-5-5"/>'),
  chevronDown: lucide('<path d="m6 9 6 6 6-6"/>'),
  chevronUp: lucide('<path d="m18 15-6-6-6 6"/>'),
  chevronRight: lucide('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: lucide('<path d="m15 18-6-6 6-6"/>'),
  chevronsUpDown: lucide('<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>'),
  x: lucide('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  minus: lucide('<path d="M5 12h14"/>'),
  plus: lucide('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  circle: lucide('<circle cx="12" cy="12" r="10"/>'),
  dot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000"><circle cx="12" cy="12" r="6"/></svg>`,
  search: lucide('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  ellipsis: lucide('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'),
  info: lucide('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
  alertTriangle: lucide('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  copy: lucide('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  settings: lucide('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
} as const

export type IconName = keyof typeof icons

export interface IconProps {
  name?: IconName
  /** Raw SVG source, for an icon outside the built-in set. */
  source?: string
  size?: number
  color: string
  style?: Style
}

export function Icon({ name, source, size = 16, color, style }: IconProps) {
  const svg = source ?? (name ? icons[name] : undefined)
  if (!svg) return null
  return <svg source={svg} style={{ width: size, height: size, flexShrink: 0, color, ...style }} />
}
