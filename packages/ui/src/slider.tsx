import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { SliderPrimitive, type Instance } from '@gpuix-ui/primitives'

export interface SliderProps extends Omit<SliderPrimitive.SliderProps, 'style' | 'children'> {
  style?: Style
  /** Track width in pixels. Needed for drag math; default 200. */
  width?: number
  thumbSize?: number
}

export const Slider = forwardRef<Instance, SliderProps>(function Slider({ style, width = 200, thumbSize = 16, disabled, ...props }, ref) {
  const t = useTheme()
  return (
    <SliderPrimitive.Root
      {...props}
      ref={ref}
      width={width}
      disabled={disabled}
      style={(state) => ({
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width,
        height: thumbSize + 4,
        flexShrink: 0,
        opacity: state.disabled ? 0.5 : 1,
        cursor: state.disabled ? 'default' : 'pointer',
        ...style,
      })}
    >
      <SliderPrimitive.Track style={{ position: 'relative', width: '100%', height: 6, borderRadius: t.radius.full, backgroundColor: t.colors.secondary, overflow: 'hidden' }}>
        <SliderPrimitive.Range style={{ height: '100%', borderRadius: t.radius.full, backgroundColor: t.colors.primary }} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        style={(state) => ({
          position: 'absolute',
          left: state.fraction * width - thumbSize / 2,
          top: 2,
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          borderWidth: 2,
          borderColor: t.colors.primary,
          backgroundColor: t.colors.background,
          boxShadow: t.shadow.sm,
          cursor: state.disabled ? 'default' : state.dragging ? 'grabbing' : 'grab',
        })}
      />
    </SliderPrimitive.Root>
  )
})
