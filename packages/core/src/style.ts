/**
 * Style helpers. GPUIX styles are plain objects, so "class merging" is object
 * merging. `hover` and `active` are nested objects and get merged one level
 * deep so an override can add a hover colour without dropping the base one.
 */
import type { StyleDesc } from '@gpuix/react'

export type Style = StyleDesc
export type StyleInput = Style | null | undefined | false

/** Merge two styles. Later wins. `hover` and `active` merge instead of replace. */
export function mergeStyle(base: StyleInput, override: StyleInput): Style {
  if (!base) return override || {}
  if (!override) return base
  const out: Style = { ...base, ...override }
  if (base.hover || override.hover) out.hover = { ...(base.hover ?? {}), ...(override.hover ?? {}) }
  if (base.active || override.active) out.active = { ...(base.active ?? {}), ...(override.active ?? {}) }
  return out
}

/**
 * Merge any number of styles, skipping falsy entries. The GPUIX equivalent of
 * shadcn's `cn()`:
 *
 *   <div style={sx(base, active && activeStyle, props.style)} />
 */
export function sx(...styles: StyleInput[]): Style {
  let out: Style = {}
  for (const style of styles) if (style) out = mergeStyle(out, style)
  return out
}

/** A style, or a function of some state that returns one. */
export type StateStyle<State> = Style | ((state: State) => Style)

export function resolveStyle<State>(style: StateStyle<State> | undefined, state: State): Style | undefined {
  return typeof style === 'function' ? style(state) : style
}
