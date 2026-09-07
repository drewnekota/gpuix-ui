/** Colour helpers for hex tokens. GPUI parses #RRGGBB and #RRGGBBAA. */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function expand(hex: string): string {
  const raw = hex.replace('#', '')
  if (raw.length === 3 || raw.length === 4) {
    return raw
      .split('')
      .map((char) => char + char)
      .join('')
  }
  return raw
}

/** Replace the alpha of a hex colour. `alpha` is 0..1. */
export function withAlpha(hex: string, alpha: number): string {
  const raw = expand(hex).slice(0, 6)
  const a = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0')
  return `#${raw}${a}`.toUpperCase()
}

/** Mix two hex colours. `amount` 0 = a, 1 = b. Alpha is dropped. */
export function mix(a: string, b: string, amount: number): string {
  const pa = expand(a)
  const pb = expand(b)
  const t = clamp(amount, 0, 1)
  const channels = [0, 2, 4].map((offset) => {
    const ca = parseInt(pa.slice(offset, offset + 2), 16)
    const cb = parseInt(pb.slice(offset, offset + 2), 16)
    return Math.round(ca + (cb - ca) * t)
      .toString(16)
      .padStart(2, '0')
  })
  return `#${channels.join('')}`.toUpperCase()
}
