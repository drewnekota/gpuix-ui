/** Headless Popover: a floating panel toggled by a trigger, dismissed by Escape or an outside press. */
import React, { createContext, forwardRef, useContext, useMemo, useRef, type ReactElement, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { FloatingLayer, floatingRootStyle, type FloatingContentProps } from './floating'
import { isActivationKey, renderSlot, setRefs, useControllableState, useFocusElement, type DivProps, type Instance } from './internal'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.MutableRefObject<Instance | null>
  triggerPressedWhileOpen: React.MutableRefObject<boolean>
  dismissedByOutsidePress: React.MutableRefObject<boolean>
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

export function usePopoverContext(name: string): PopoverContextValue {
  const context = useContext(PopoverContext)
  if (!context) throw new Error(`${name} must be used inside Popover`)
  return context
}

export interface PopoverProps extends Omit<DivProps, 'children'> {
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Popover({ children, open: openProp, defaultOpen = false, onOpenChange, style, ...props }: PopoverProps): ReactElement {
  const focus = useFocusElement()
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange })
  const triggerRef = useRef<Instance | null>(null)
  const triggerPressedWhileOpen = useRef(false)
  const dismissedByOutsidePress = useRef(false)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    if (!next) focus(triggerRef.current)
  }
  const context = useMemo<PopoverContextValue>(
    () => ({ open, setOpen, triggerRef, triggerPressedWhileOpen, dismissedByOutsidePress }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  )
  return (
    <PopoverContext.Provider value={context}>
      <div {...props} style={floatingRootStyle(style)}>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export interface PopoverTriggerState {
  open: boolean
  disabled: boolean
}

export interface PopoverTriggerProps extends Omit<DivProps, 'style'> {
  asChild?: boolean
  disabled?: boolean
  style?: StateStyle<PopoverTriggerState>
}

export const PopoverTrigger = forwardRef<Instance, PopoverTriggerProps>(function PopoverTrigger(
  { asChild, disabled = false, style, children, onMouseDown, onClick, onKeyDown, ...props },
  forwardedRef,
) {
  const context = usePopoverContext('PopoverTrigger')
  const state = { open: context.open, disabled }
  const ref = (value: Instance | null) => {
    context.triggerRef.current = value
    setRefs(value, forwardedRef)
  }
  return renderSlot({
    asChild,
    children,
    ref,
    props: {
      ...props,
      tabIndex: disabled ? -1 : asChild ? props.tabIndex : (props.tabIndex ?? 0),
      style: resolveStyle(style, state),
      onMouseDown: (event: EventPayload) => {
        onMouseDown?.(event)
        context.triggerPressedWhileOpen.current = context.open
      },
      onClick: (event: EventPayload) => {
        onClick?.(event)
        if (disabled) return
        if (context.dismissedByOutsidePress.current) {
          context.dismissedByOutsidePress.current = false
          return
        }
        if (context.triggerPressedWhileOpen.current) {
          context.triggerPressedWhileOpen.current = false
          context.setOpen(false)
          return
        }
        context.setOpen(!context.open)
      },
      onKeyDown: (event: EventPayload) => {
        onKeyDown?.(event)
        if (disabled) return
        if (event.key === 'escape') context.setOpen(false)
        else if (isActivationKey(event)) context.setOpen(!context.open)
      },
    },
  })
})

export interface PopoverContentProps extends FloatingContentProps {
  onEscapeKeyDown?: (event: EventPayload) => void
  onInteractOutside?: (event: EventPayload) => void
  /** Close when the user presses outside. Default true. */
  dismissOnOutsidePress?: boolean
}

export const PopoverContent = forwardRef<Instance, PopoverContentProps>(function PopoverContent(
  { children, onMouseDownOutside, onKeyDown, onEscapeKeyDown, onInteractOutside, dismissOnOutsidePress = true, tabIndex = 0, ...props },
  ref,
) {
  const context = usePopoverContext('PopoverContent')
  if (!context.open) return null
  return (
    <FloatingLayer
      {...props}
      ref={ref}
      tabIndex={tabIndex}
      autoFocus
      onMouseDownOutside={(event) => {
        onMouseDownOutside?.(event)
        onInteractOutside?.(event)
        if (!dismissOnOutsidePress) return
        context.dismissedByOutsidePress.current = true
        queueMicrotask(() => {
          context.dismissedByOutsidePress.current = false
        })
        context.setOpen(false)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key === 'escape') {
          onEscapeKeyDown?.(event)
          context.setOpen(false)
        }
      }}
    >
      {children}
    </FloatingLayer>
  )
})

export interface PopoverCloseProps extends DivProps {
  asChild?: boolean
}

export const PopoverClose = forwardRef<Instance, PopoverCloseProps>(function PopoverClose({ asChild, children, onClick, ...props }, ref) {
  const context = usePopoverContext('PopoverClose')
  return renderSlot({
    asChild,
    children,
    ref,
    props: {
      ...props,
      onClick: (event: EventPayload) => {
        onClick?.(event)
        context.setOpen(false)
      },
    },
  })
})

export { Popover as Root, PopoverTrigger as Trigger, PopoverContent as Content, PopoverClose as Close }
