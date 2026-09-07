/**
 * Native motion only animates width, height, opacity, and radius, so there is
 * no rotation. Three dots pulsing in sequence read as activity at any size.
 */
import React, { useEffect, useState } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'

export interface SpinnerProps {
  size?: number
  color?: string
  style?: Style
  /** Milliseconds per step. */
  interval?: number
}

export function Spinner({ size = 6, color, style, interval = 220 }: SpinnerProps) {
  const t = useTheme()
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setStep((current) => (current + 1) % 3), interval)
    return () => clearInterval(timer)
  }, [interval])
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: size / 2, ...style }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color ?? t.colors.mutedForeground,
            opacity: index === step ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  )
}
