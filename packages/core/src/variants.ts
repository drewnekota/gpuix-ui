/**
 * `sv` — style variants. The cva of gpuix-ui.
 *
 *   const button = sv({
 *     base: { display: 'flex', borderRadius: 6 },
 *     variants: {
 *       variant: { default: { backgroundColor: '#fff' }, ghost: {} },
 *       size: { sm: { height: 28 }, md: { height: 36 } },
 *     },
 *     defaultVariants: { variant: 'default', size: 'md' },
 *     compoundVariants: [{ variant: 'ghost', size: 'sm', style: { padding: 0 } }],
 *   })
 *
 *   button({ variant: 'ghost', style: { width: 100 } })
 *
 * Because GPUIX has no CSS, variant values are style objects and the theme
 * must be closed over. Write variant factories as `(theme) => sv({...})` and
 * memoise them per theme with `useVariants`.
 */
import { useMemo } from 'react'
import { mergeStyle, type Style, type StyleInput } from './style'
import { useTheme, type Theme } from './theme'

type VariantSchema = Record<string, Record<string, StyleInput>>

type VariantSelection<V extends VariantSchema> = {
  [K in keyof V]?: keyof V[K] | null | undefined
}

export interface SvConfig<V extends VariantSchema> {
  base?: StyleInput
  variants?: V
  defaultVariants?: VariantSelection<V>
  compoundVariants?: Array<VariantSelection<V> & { style: StyleInput }>
}

export type SvProps<V extends VariantSchema> = VariantSelection<V> & { style?: StyleInput }
export type SvFn<V extends VariantSchema> = ((props?: SvProps<V>) => Style) & { variants: V }

/** Extract the variant prop types from an `sv` function. */
export type VariantProps<T> = T extends SvFn<infer V> ? VariantSelection<V> : never

export function sv<V extends VariantSchema>(config: SvConfig<V>): SvFn<V> {
  const variants = (config.variants ?? {}) as V
  const fn = (props: SvProps<V> = {}) => {
    let out: Style = mergeStyle(undefined, config.base)
    const selected: Record<string, unknown> = {}
    for (const name of Object.keys(variants)) {
      const value = props[name as keyof V] ?? config.defaultVariants?.[name as keyof V]
      selected[name] = value
      if (value == null) continue
      out = mergeStyle(out, variants[name]?.[value as string])
    }
    for (const compound of config.compoundVariants ?? []) {
      const { style, ...match } = compound
      const hit = Object.entries(match).every(([key, value]) => selected[key] === value)
      if (hit) out = mergeStyle(out, style)
    }
    return mergeStyle(out, props.style)
  }
  return Object.assign(fn, { variants })
}

/** Memoise a theme-dependent variant factory for the current theme. */
export function useVariants<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme()
  return useMemo(() => factory(theme), [theme, factory])
}
