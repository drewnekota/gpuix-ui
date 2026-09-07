import { describe, expect, it } from 'vitest'
import { mix, withAlpha } from './color'
import { mergeStyle, resolveStyle, sx } from './style'
import { createTheme, darkTheme, lightTheme, toGpuixTheme } from './theme'
import { sv } from './variants'

describe('color', () => {
  it('appends alpha and mixes', () => {
    expect(withAlpha('#ffffff', 0.5)).toBe('#FFFFFF80')
    expect(withAlpha('#fff', 1)).toBe('#FFFFFFFF')
    expect(mix('#000000', '#ffffff', 0.5).toLowerCase()).toBe('#808080')
  })
})

describe('style', () => {
  it('merges nested hover/active blocks', () => {
    const merged = mergeStyle({ padding: 4, hover: { opacity: 0.5 } }, { padding: 8, hover: { backgroundColor: '#fff' } })
    expect(merged).toEqual({ padding: 8, hover: { opacity: 0.5, backgroundColor: '#fff' } })
    expect(sx({ width: 1 }, undefined, { height: 2 })).toEqual({ width: 1, height: 2 })
    expect(resolveStyle((state: { open: boolean }) => ({ opacity: state.open ? 1 : 0 }), { open: true })).toEqual({ opacity: 1 })
  })
})

describe('sv', () => {
  it('applies defaults, variants, and compound variants', () => {
    const button = sv({
      base: { height: 32 },
      variants: {
        variant: { solid: { backgroundColor: '#000' }, ghost: { backgroundColor: '#0000' } },
        size: { sm: { height: 28 }, md: { height: 32 } },
      },
      defaultVariants: { variant: 'solid', size: 'md' },
      compoundVariants: [{ variant: 'ghost', size: 'sm', style: { padding: 2 } }],
    })
    expect(button({})).toEqual({ height: 32, backgroundColor: '#000' })
    expect(button({ variant: 'ghost', size: 'sm' })).toEqual({ height: 28, backgroundColor: '#0000', padding: 2 })
  })
})

describe('theme', () => {
  it('deep-merges overrides and maps to the GPUIX theme', () => {
    const theme = createTheme(darkTheme, { colors: { primary: '#ff0000' } })
    expect(theme.colors.primary).toBe('#ff0000')
    expect(theme.colors.background).toBe(darkTheme.colors.background)
    expect(lightTheme.appearance).toBe('light')
    expect(toGpuixTheme(theme)).toBeTypeOf('object')
  })
})
