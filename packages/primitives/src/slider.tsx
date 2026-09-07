/**
 * Headless Slider.
 *
 * GPUIX has no JS-side way to read an element's bounds, so the thumb cannot
 * jump to an arbitrary press on the track. What works without bounds:
 * dragging the thumb (pointer delta over a known track `width`), pressing the
 * filled or unfilled part of the track (one page step in that direction), and
 * the keyboard. Pass the real pixel width of the track through `width`.
 */
import React, { createContext, forwardRef, useContext, useMemo, useRef, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { useControllableState, type DivProps, type Instance } from './internal'

export interface SliderState {
  value: number
  min: number
  max: number
  /** 0..1 */
  fraction: number
  dragging: boolean
  disabled: boolean
}

interface SliderContextValue extends SliderState {
  width: number
  pageSteps: number
  set: (value: number) => void
  stepBy: (steps: number) => void
  startDrag: (event: EventPayload) => void
  moveDrag: (event: EventPayload) => void
  endDrag: () => void
}

const SliderContext = createContext<SliderContextValue | null>(null)

function useSliderContext(name: string): SliderContextValue {
  const context = useContext(SliderContext)
  if (!context) throw new Error(`${name} must be used inside Slider`)
  return context
}

export interface SliderProps extends Omit<DivProps, 'style' | 'children' | 'onChange'> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Fires when a drag ends or a key is released. */
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Pixel width of the track. Needed to turn a drag delta into a value. */
  width?: number
  /** Steps per page for a track press or PageUp/PageDown. Default 10. */
  pageSteps?: number
  disabled?: boolean
  style?: StateStyle<SliderState>
  children?: ReactNode | ((state: SliderState) => ReactNode)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function snap(value: number, min: number, step: number) {
  const steps = Math.round((value - min) / step)
  const snapped = min + steps * step
  return Number(snapped.toFixed(6))
}

export const Slider = forwardRef<Instance, SliderProps>(function Slider(
  { value: valueProp, defaultValue = 0, onValueChange, onValueCommit, min = 0, max = 100, step = 1, width = 200, pageSteps = 10, disabled = false, style, children, onKeyDown, onKeyUp, onMouseDown, ...props },
  ref,
) {
  const [value, setValueState] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange })
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, value: 0 })
  const [, force] = React.useState(0)
  const set = (next: number) => setValueState(clamp(snap(next, min, step), min, max))
  const stepBy = (steps: number) => set(value + steps * step)
  const state: SliderState = { value, min, max, fraction: max > min ? (value - min) / (max - min) : 0, dragging: dragging.current, disabled }
  const context: SliderContextValue = {
    ...state,
    width,
    pageSteps,
    set,
    stepBy,
    startDrag: (event) => {
      if (disabled) return
      dragging.current = true
      dragStart.current = { x: event.x ?? 0, value }
      force((n) => n + 1)
    },
    moveDrag: (event) => {
      if (!dragging.current) return
      const delta = (event.x ?? 0) - dragStart.current.x
      set(dragStart.current.value + (delta / width) * (max - min))
    },
    endDrag: () => {
      if (!dragging.current) return
      dragging.current = false
      onValueCommit?.(value)
      force((n) => n + 1)
    },
  }
  return (
    <SliderContext.Provider value={context}>
      <div
        {...props}
        ref={ref}
        tabIndex={disabled ? -1 : (props.tabIndex ?? 0)}
        style={resolveStyle(style, state)}
        onMouseDown={(event) => {
          onMouseDown?.(event)
          // A press on the bare track (not the range, which is a filled child) means "past the thumb".
          if (!disabled) stepBy(pageSteps)
        }}
        onKeyDown={(event: EventPayload) => {
          onKeyDown?.(event)
          if (disabled) return
          const big = event.modifiers?.shift ? pageSteps : 1
          if (event.key === 'right' || event.key === 'up') stepBy(big)
          else if (event.key === 'left' || event.key === 'down') stepBy(-big)
          else if (event.key === 'home') set(min)
          else if (event.key === 'end') set(max)
          else if (event.key === 'pageup') stepBy(pageSteps)
          else if (event.key === 'pagedown') stepBy(-pageSteps)
        }}
        onKeyUp={(event: EventPayload) => {
          onKeyUp?.(event)
          onValueCommit?.(value)
        }}
      >
        {typeof children === 'function' ? children(state) : children}
      </div>
    </SliderContext.Provider>
  )
})

export interface SliderPartProps extends Omit<DivProps, 'style'> {
  style?: StateStyle<SliderState>
}

/** The unfilled track. A filled track blocks the root, so it steps toward the max itself. */
export const SliderTrack = forwardRef<Instance, SliderPartProps>(function SliderTrack({ style, onMouseDown, ...props }, ref) {
  const slider = useSliderContext('SliderTrack')
  return (
    <div
      {...props}
      ref={ref}
      style={resolveStyle(style, slider)}
      onMouseDown={(event) => {
        onMouseDown?.(event)
        if (!slider.disabled) slider.stepBy(slider.pageSteps)
      }}
    />
  )
})

/** The filled part from min to the thumb. Presses on it step toward the min. */
export const SliderRange = forwardRef<Instance, SliderPartProps>(function SliderRange({ style, onMouseDown, ...props }, ref) {
  const slider = useSliderContext('SliderRange')
  return (
    <div
      {...props}
      ref={ref}
      style={{ width: `${slider.fraction * 100}%`, ...resolveStyle(style, slider) }}
      onMouseDown={(event) => {
        onMouseDown?.(event)
        if (!slider.disabled) slider.stepBy(-slider.pageSteps)
      }}
    />
  )
})

/** The draggable handle. Owns the press so GPUI arms mouse capture on it. */
export const SliderThumb = forwardRef<Instance, SliderPartProps>(function SliderThumb({ style, onMouseDown, onMouseMove, onMouseUp, ...props }, ref) {
  const slider = useSliderContext('SliderThumb')
  return (
    <div
      {...props}
      ref={ref}
      style={resolveStyle(style, slider)}
      onMouseDown={(event) => {
        onMouseDown?.(event)
        slider.startDrag(event)
      }}
      onMouseMove={(event) => {
        onMouseMove?.(event)
        slider.moveDrag(event)
      }}
      onMouseUp={(event) => {
        onMouseUp?.(event)
        slider.endDrag()
      }}
    />
  )
})

export function useSliderState(): SliderState {
  const { value, min, max, fraction, dragging, disabled } = useSliderContext('useSliderState')
  return { value, min, max, fraction, dragging, disabled }
}

export { Slider as Root, SliderTrack as Track, SliderRange as Range, SliderThumb as Thumb }
