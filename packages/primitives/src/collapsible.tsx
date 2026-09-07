/** Headless Collapsible: a trigger that shows or hides content in place. */
import React, { createContext, forwardRef, useContext, useMemo, type ReactElement, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { isActivationKey, renderSlot, useControllableState, type DivProps, type Instance } from './internal'

interface CollapsibleContextValue {
  open: boolean
  disabled: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null)

function useCollapsibleContext(name: string): CollapsibleContextValue {
  const context = useContext(CollapsibleContext)
  if (!context) throw new Error(`${name} must be used inside Collapsible`)
  return context
}

export interface CollapsibleProps extends DivProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

export const Collapsible = forwardRef<Instance, CollapsibleProps>(function Collapsible(
  { open: openProp, defaultOpen = false, onOpenChange, disabled = false, children, style, ...props },
  ref,
): ReactElement {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange })
  const context = useMemo<CollapsibleContextValue>(() => ({ open, disabled, setOpen }), [open, disabled, setOpen])
  return (
    <CollapsibleContext.Provider value={context}>
      <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', ...style }}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
})

export interface CollapsibleTriggerState {
  open: boolean
  disabled: boolean
}

export interface CollapsibleTriggerProps extends Omit<DivProps, 'style' | 'children'> {
  asChild?: boolean
  style?: StateStyle<CollapsibleTriggerState>
  children?: ReactNode | ((state: CollapsibleTriggerState) => ReactNode)
}

export const CollapsibleTrigger = forwardRef<Instance, CollapsibleTriggerProps>(function CollapsibleTrigger(
  { asChild, style, children, onClick, onKeyDown, ...props },
  ref,
) {
  const context = useCollapsibleContext('CollapsibleTrigger')
  const state = { open: context.open, disabled: context.disabled }
  return renderSlot({
    asChild,
    children: typeof children === 'function' ? children(state) : children,
    ref,
    props: {
      ...props,
      tabIndex: context.disabled ? -1 : asChild ? props.tabIndex : (props.tabIndex ?? 0),
      style: resolveStyle(style, state),
      onClick: (event: EventPayload) => {
        onClick?.(event)
        if (!context.disabled) context.setOpen(!context.open)
      },
      onKeyDown: (event: EventPayload) => {
        onKeyDown?.(event)
        if (!context.disabled && isActivationKey(event)) context.setOpen(!context.open)
      },
    },
  })
})

export const CollapsibleContent = forwardRef<Instance, DivProps & { forceMount?: boolean }>(function CollapsibleContent({ forceMount, children, ...props }, ref) {
  const context = useCollapsibleContext('CollapsibleContent')
  if (!context.open && !forceMount) return null
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  )
})

export { Collapsible as Root, CollapsibleTrigger as Trigger, CollapsibleContent as Content }
