/** Shared plumbing for the headless primitives. Not part of the public API. */
import React, { cloneElement, isValidElement, useCallback, useRef, useState, type ReactElement, type ReactNode, type Ref } from 'react'
import type { JSX } from '@gpuix/react/jsx-runtime'
import { useGpuix, type EventPayload, type PublicInstance } from '@gpuix/react'
import { mergeStyle } from '@gpuix-ui/core'

type HostDivProps = JSX.IntrinsicElements['div']
type HostTextProps = JSX.IntrinsicElements['text']
// Interfaces, not aliases: emitted declarations then name these instead of reaching into @gpuix/react internals.
export interface DivProps extends HostDivProps {}
export interface TextProps extends HostTextProps {}
/** An interface (not an alias) so emitted declarations name it instead of reaching into @gpuix/react internals. */
export interface Instance extends PublicInstance {}
export type Handler = ((event: EventPayload) => void) | undefined

export function useControllableState<Value>({
  value,
  defaultValue,
  onChange,
}: {
  value: Value | undefined
  defaultValue: Value
  onChange?: (value: Value) => void
}): [Value, (value: Value) => void] {
  const [internal, setInternal] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? (value as Value) : internal
  const set = useCallback(
    (next: Value) => {
      if (!controlled) setInternal(next)
      if (!Object.is(current, next)) onChange?.(next)
    },
    [controlled, current, onChange],
  )
  return [current, set]
}

export function composeHandlers(first: Handler, second: Handler): Handler {
  if (!first) return second
  if (!second) return first
  return (event) => {
    first(event)
    second(event)
  }
}

export function setRefs<T>(value: T, ...refs: Array<Ref<T> | undefined>) {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(value)
    else if (ref) (ref as React.RefObject<T | null>).current = value
  }
}

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): (value: T | null) => void {
  return (value) => setRefs(value as T, ...refs)
}

const HANDLER_KEYS = [
  'onClick',
  'onAuxClick',
  'onMouseDown',
  'onMouseUp',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseDownOutside',
  'onKeyDown',
  'onKeyUp',
  'onFocus',
  'onBlur',
  'onScroll',
  'onChange',
  'onSubmit',
] as const

function getElementRef(element: ReactElement): Ref<Instance> | undefined {
  const props = element.props as { ref?: Ref<Instance> }
  if (props.ref) return props.ref
  const descriptor = Object.getOwnPropertyDescriptor(element, 'ref')
  return descriptor?.value
}

/**
 * The `asChild` slot. Without it the primitive renders a `div`; with it the
 * primitive merges its props (handlers composed, styles merged) into the one
 * child element so the host element is whatever the caller passed.
 */
export function renderSlot({
  asChild,
  children,
  props,
  ref,
}: {
  asChild?: boolean
  children: ReactNode
  props: DivProps
  ref?: Ref<Instance>
}): ReactElement {
  if (!asChild) {
    return React.createElement('div', { ...props, ref }, children)
  }
  if (!isValidElement(children)) throw new Error('asChild requires exactly one React element')
  const child = children as ReactElement<DivProps>
  const childProps = child.props
  const merged: DivProps & { ref?: Ref<Instance> } = {
    ...childProps,
    ...props,
    style: mergeStyle(childProps.style, props.style),
  }
  for (const key of HANDLER_KEYS) {
    const composed = composeHandlers(childProps[key] as Handler, props[key] as Handler)
    if (composed) (merged as Record<string, unknown>)[key] = composed
  }
  if (props.tabIndex === undefined) merged.tabIndex = childProps.tabIndex
  const childRef = getElementRef(child)
  if (childRef || ref) merged.ref = mergeRefs(childRef, ref)
  return cloneElement(child, merged)
}

/** Move keyboard focus to a host element, if the renderer can. */
export function useFocusElement(): (instance: Instance | null | undefined) => void {
  const { renderer } = useGpuix()
  return useCallback(
    (instance) => {
      if (instance && renderer?.focusElement) renderer.focusElement(instance.id)
    },
    [renderer],
  )
}

export function isActivationKey(event: EventPayload): boolean {
  return event.key === 'enter' || event.key === 'space'
}

let counter = 0
/** A stable id per component instance, for item registries. */
export function useStableId(prefix: string): string {
  const ref = useRef<string | null>(null)
  if (ref.current === null) ref.current = `${prefix}-${++counter}`
  return ref.current
}

export interface RegistryItem {
  id: string
  disabled: boolean
  order: number
}

/**
 * An ordered registry of items inside a menu, radio group, or tab list.
 * Items register in mount order, which is tree order for siblings.
 */
export function useItemRegistry<T extends RegistryItem>() {
  const items = useRef(new Map<string, T>())
  const order = useRef(0)
  const register = useCallback((item: Omit<T, 'order'>) => {
    const existing = items.current.get(item.id)
    items.current.set(item.id, { ...item, order: existing?.order ?? order.current++ } as T)
    return () => {
      items.current.delete(item.id)
    }
  }, [])
  const list = useCallback(
    () => [...items.current.values()].sort((a, b) => a.order - b.order),
    [],
  )
  const enabled = useCallback(() => list().filter((item) => !item.disabled), [list])
  const step = useCallback(
    (currentId: string | null, delta: number): T | undefined => {
      const candidates = enabled()
      if (candidates.length === 0) return undefined
      const index = candidates.findIndex((item) => item.id === currentId)
      if (index < 0) return delta > 0 ? candidates[0] : candidates[candidates.length - 1]
      return candidates[(index + delta + candidates.length) % candidates.length]
    },
    [enabled],
  )
  return { items, register, list, enabled, step }
}
