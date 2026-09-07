/** Headless Accordion: one or many items open at a time. */
import React, { createContext, forwardRef, useContext, useMemo, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { isActivationKey, useControllableState, type DivProps, type Instance } from './internal'

interface AccordionContextValue {
  openValues: string[]
  toggle: (value: string) => void
  disabled: boolean
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function useAccordionContext(name: string): AccordionContextValue {
  const context = useContext(AccordionContext)
  if (!context) throw new Error(`${name} must be used inside Accordion`)
  return context
}

type SingleProps = {
  type?: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Allow closing the open item. Default false, like Radix. */
  collapsible?: boolean
}
type MultipleProps = {
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  collapsible?: never
}

export type AccordionProps = Omit<DivProps, 'onChange'> & { disabled?: boolean } & (SingleProps | MultipleProps)

export const Accordion = forwardRef<Instance, AccordionProps>(function Accordion(props, ref) {
  const { children, style, disabled = false, ...rest } = props
  const multiple = props.type === 'multiple'
  const [value, setValue] = useControllableState<string[]>({
    value: multiple ? (props.value as string[] | undefined) : props.value === undefined ? undefined : props.value ? [props.value] : [],
    defaultValue: multiple ? ((props.defaultValue as string[] | undefined) ?? []) : props.defaultValue ? [props.defaultValue as string] : [],
    onChange: (next) => {
      if (multiple) (props.onValueChange as MultipleProps['onValueChange'])?.(next)
      else (props.onValueChange as SingleProps['onValueChange'])?.(next[0] ?? '')
    },
  })
  const collapsible = multiple ? true : (props.collapsible ?? false)
  const context = useMemo<AccordionContextValue>(
    () => ({
      openValues: value,
      disabled,
      toggle: (item) => {
        const open = value.includes(item)
        if (multiple) setValue(open ? value.filter((v) => v !== item) : [...value, item])
        else if (open) {
          if (collapsible) setValue([])
        } else setValue([item])
      },
    }),
    [value, disabled, multiple, collapsible, setValue],
  )
  const { type: _type, value: _value, defaultValue: _defaultValue, onValueChange: _onValueChange, collapsible: _collapsible, ...divProps } = rest as Record<string, unknown>
  return (
    <AccordionContext.Provider value={context}>
      <div {...(divProps as DivProps)} ref={ref} style={{ display: 'flex', flexDirection: 'column', ...style }}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
})

interface ItemContextValue {
  value: string
  open: boolean
  disabled: boolean
}
const ItemContext = createContext<ItemContextValue | null>(null)

function useItemContext(name: string): ItemContextValue {
  const context = useContext(ItemContext)
  if (!context) throw new Error(`${name} must be used inside AccordionItem`)
  return context
}

export interface AccordionItemProps extends DivProps {
  value: string
  disabled?: boolean
}

export const AccordionItem = forwardRef<Instance, AccordionItemProps>(function AccordionItem({ value, disabled = false, children, style, ...props }, ref) {
  const accordion = useAccordionContext('AccordionItem')
  const context = useMemo<ItemContextValue>(
    () => ({ value, open: accordion.openValues.includes(value), disabled: disabled || accordion.disabled }),
    [value, accordion.openValues, disabled, accordion.disabled],
  )
  return (
    <ItemContext.Provider value={context}>
      <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', ...style }}>
        {children}
      </div>
    </ItemContext.Provider>
  )
})

export interface AccordionTriggerState {
  open: boolean
  disabled: boolean
}

export interface AccordionTriggerProps extends Omit<DivProps, 'style' | 'children'> {
  style?: StateStyle<AccordionTriggerState>
  children?: ReactNode | ((state: AccordionTriggerState) => ReactNode)
}

export const AccordionTrigger = forwardRef<Instance, AccordionTriggerProps>(function AccordionTrigger({ style, children, onClick, onKeyDown, ...props }, ref) {
  const accordion = useAccordionContext('AccordionTrigger')
  const item = useItemContext('AccordionTrigger')
  const state: AccordionTriggerState = { open: item.open, disabled: item.disabled }
  return (
    <div
      {...props}
      ref={ref}
      tabIndex={item.disabled ? -1 : (props.tabIndex ?? 0)}
      style={resolveStyle(style, state)}
      onClick={(event) => {
        onClick?.(event)
        if (!item.disabled) accordion.toggle(item.value)
      }}
      onKeyDown={(event: EventPayload) => {
        onKeyDown?.(event)
        if (!item.disabled && isActivationKey(event)) accordion.toggle(item.value)
      }}
    >
      {typeof children === 'function' ? children(state) : children}
    </div>
  )
})

export const AccordionContent = forwardRef<Instance, DivProps & { forceMount?: boolean }>(function AccordionContent({ forceMount, children, ...props }, ref) {
  const item = useItemContext('AccordionContent')
  if (!item.open && !forceMount) return null
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  )
})

export function useAccordionItemState(): AccordionTriggerState {
  const item = useItemContext('useAccordionItemState')
  return { open: item.open, disabled: item.disabled }
}

export { Accordion as Root, AccordionItem as Item, AccordionTrigger as Trigger, AccordionContent as Content }
