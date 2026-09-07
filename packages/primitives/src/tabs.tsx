/** Headless Tabs. Arrow keys move between triggers and focus them natively. */
import React, { createContext, forwardRef, useContext, useLayoutEffect, useMemo, useRef, type ReactElement, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { isActivationKey, useControllableState, useFocusElement, useItemRegistry, type DivProps, type Instance, type RegistryItem } from './internal'

interface TabRecord extends RegistryItem {
  value: string
  instance: Instance | null
}

interface TabsContextValue {
  value: string | undefined
  setValue: (value: string) => void
  orientation: 'horizontal' | 'vertical'
  activationMode: 'automatic' | 'manual'
  register: (item: Omit<TabRecord, 'order'>) => () => void
  step: (currentId: string | null, delta: number) => TabRecord | undefined
  first: () => TabRecord | undefined
  last: () => TabRecord | undefined
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(name: string): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) throw new Error(`${name} must be used inside Tabs`)
  return context
}

export interface TabsProps extends Omit<DivProps, 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  /** `automatic` selects on arrow key. `manual` only moves focus. */
  activationMode?: 'automatic' | 'manual'
}

export const Tabs = forwardRef<Instance, TabsProps>(function Tabs(
  { value: valueProp, defaultValue, onValueChange, orientation = 'horizontal', activationMode = 'automatic', children, style, ...props },
  ref,
): ReactElement {
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  })
  const registry = useItemRegistry<TabRecord>()
  const context = useMemo<TabsContextValue>(
    () => ({
      value,
      setValue: (next: string) => setValue(next),
      orientation,
      activationMode,
      register: registry.register,
      step: registry.step,
      first: () => registry.enabled()[0],
      last: () => registry.enabled().at(-1),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, orientation, activationMode],
  )
  return (
    <TabsContext.Provider value={context}>
      <div {...props} ref={ref} style={{ display: 'flex', flexDirection: orientation === 'vertical' ? 'row' : 'column', ...style }}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})

export const TabsList = forwardRef<Instance, DivProps>(function TabsList({ style, ...props }, ref) {
  const context = useTabsContext('TabsList')
  return (
    <div
      {...props}
      ref={ref}
      style={{ display: 'flex', flexDirection: context.orientation === 'vertical' ? 'column' : 'row', ...style }}
    />
  )
})

export interface TabsTriggerState {
  active: boolean
  disabled: boolean
}

export interface TabsTriggerProps extends Omit<DivProps, 'style' | 'children'> {
  value: string
  disabled?: boolean
  style?: StateStyle<TabsTriggerState>
  children?: ReactNode | ((state: TabsTriggerState) => ReactNode)
}

export const TabsTrigger = forwardRef<Instance, TabsTriggerProps>(function TabsTrigger(
  { value, disabled = false, style, children, onClick, onKeyDown, ...props },
  forwardedRef,
) {
  const context = useTabsContext('TabsTrigger')
  const focus = useFocusElement()
  const instanceRef = useRef<Instance | null>(null)
  useLayoutEffect(
    () => context.register({ id: value, value, disabled, instance: instanceRef.current }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, disabled],
  )
  const state: TabsTriggerState = { active: context.value === value, disabled }
  const move = (target: TabRecord | undefined) => {
    if (!target) return
    focus(target.instance)
    if (context.activationMode === 'automatic') context.setValue(target.value)
  }
  const horizontal = context.orientation === 'horizontal'
  return (
    <div
      {...props}
      ref={(instance) => {
        instanceRef.current = instance
        if (typeof forwardedRef === 'function') forwardedRef(instance)
        else if (forwardedRef) forwardedRef.current = instance
      }}
      tabIndex={disabled ? -1 : (props.tabIndex ?? 0)}
      style={resolveStyle(style, state)}
      onClick={(event) => {
        onClick?.(event)
        if (!disabled) context.setValue(value)
      }}
      onKeyDown={(event: EventPayload) => {
        onKeyDown?.(event)
        if (disabled) return
        const next = horizontal ? 'right' : 'down'
        const prev = horizontal ? 'left' : 'up'
        if (event.key === next) move(context.step(value, 1))
        else if (event.key === prev) move(context.step(value, -1))
        else if (event.key === 'home') move(context.first())
        else if (event.key === 'end') move(context.last())
        else if (isActivationKey(event)) context.setValue(value)
      }}
    >
      {typeof children === 'function' ? children(state) : children}
    </div>
  )
})

export interface TabsContentProps extends DivProps {
  value: string
  forceMount?: boolean
}

export const TabsContent = forwardRef<Instance, TabsContentProps>(function TabsContent({ value, forceMount, children, style, ...props }, ref) {
  const context = useTabsContext('TabsContent')
  const active = context.value === value
  if (!active && !forceMount) return null
  return (
    <div {...props} ref={ref} style={{ ...style, display: active ? (style?.display ?? 'flex') : 'none' }}>
      {children}
    </div>
  )
})

export { Tabs as Root, TabsList as List, TabsTrigger as Trigger, TabsContent as Content }
