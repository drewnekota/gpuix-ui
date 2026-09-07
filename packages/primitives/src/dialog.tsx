/**
 * Headless Dialog: a modal layer over the whole window.
 *
 * `<anchored position={{x:0,y:0}} deferred>` is window-absolute, so the overlay
 * covers everything, including a `<virtual-list>`, without a portal. The panel
 * holds focus for Escape and closes on an outside press through
 * `onMouseDownOutside`; GPUI does not bubble mouse events, so a backdrop
 * `onMouseDown` would never see a press that landed on the panel anyway.
 */
import React, { createContext, forwardRef, useContext, useMemo, useRef, type ReactElement, type ReactNode } from 'react'
import { useWindowSize, type EventPayload } from '@gpuix/react'
import { mergeStyle } from '@gpuix-ui/core'
import { isActivationKey, renderSlot, setRefs, useControllableState, useFocusElement, type DivProps, type Instance, type TextProps } from './internal'

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.MutableRefObject<Instance | null>
}

const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialogContext(name: string): DialogContextValue {
  const context = useContext(DialogContext)
  if (!context) throw new Error(`${name} must be used inside Dialog`)
  return context
}

export interface DialogProps {
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Dialog({ children, open: openProp, defaultOpen = false, onOpenChange }: DialogProps): ReactElement {
  const focus = useFocusElement()
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange })
  const triggerRef = useRef<Instance | null>(null)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    if (!next) focus(triggerRef.current)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const context = useMemo<DialogContextValue>(() => ({ open, setOpen, triggerRef }), [open])
  return <DialogContext.Provider value={context}>{children}</DialogContext.Provider>
}

export interface DialogTriggerProps extends DivProps {
  asChild?: boolean
  disabled?: boolean
}

export const DialogTrigger = forwardRef<Instance, DialogTriggerProps>(function DialogTrigger(
  { asChild, disabled = false, children, onClick, onKeyDown, ...props },
  forwardedRef,
) {
  const context = useDialogContext('DialogTrigger')
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
      onClick: (event: EventPayload) => {
        onClick?.(event)
        if (!disabled) context.setOpen(true)
      },
      onKeyDown: (event: EventPayload) => {
        onKeyDown?.(event)
        if (!disabled && isActivationKey(event)) context.setOpen(true)
      },
    },
  })
})

/** Paint order of the modal layers. Popovers use 1, so a menu inside a dialog still paints on top. */
const OVERLAY_PRIORITY = 2
const CONTENT_PRIORITY = 3

export interface DialogOverlayProps extends DivProps {}

/** A full-window backdrop. Swallows the wheel so nothing behind the dialog scrolls. */
export const DialogOverlay = forwardRef<Instance, DialogOverlayProps>(function DialogOverlay({ style, ...props }, ref) {
  const context = useDialogContext('DialogOverlay')
  const { width, height } = useWindowSize()
  if (!context.open) return null
  return (
    <anchored position={{ x: 0, y: 0 }} deferred priority={OVERLAY_PRIORITY} occlude>
      <div
        {...props}
        ref={ref}
        style={mergeStyle({ width, height, backgroundColor: '#00000080', pointerEvents: 'auto' }, style)}
      />
    </anchored>
  )
})

export interface DialogContentProps extends DivProps {
  onEscapeKeyDown?: (event: EventPayload) => void
  onInteractOutside?: (event: EventPayload) => void
  /** Close when the user presses outside the panel. Default true. Alert dialogs set false. */
  dismissOnOutsidePress?: boolean
  /** Where the panel sits in the window. Default centred. */
  placement?: 'center' | 'top'
  /** Distance from the top edge when `placement` is `top`. */
  topOffset?: number
  /** Dock the panel to a window edge and stretch it along that edge. Sheets use this; it overrides `placement`. */
  side?: 'left' | 'right' | 'top' | 'bottom'
}

function containerStyle(placement: 'center' | 'top', topOffset: number, side?: 'left' | 'right' | 'top' | 'bottom') {
  if (side === 'left') return { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch' } as const
  if (side === 'right') return { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'stretch' } as const
  if (side === 'top') return { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch' } as const
  if (side === 'bottom') return { flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'stretch' } as const
  return {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: placement === 'center' ? 'center' : 'flex-start',
    paddingTop: placement === 'top' ? topOffset : 0,
  } as const
}

export const DialogContent = forwardRef<Instance, DialogContentProps>(function DialogContent(
  {
    children,
    style,
    onKeyDown,
    onMouseDownOutside,
    onEscapeKeyDown,
    onInteractOutside,
    dismissOnOutsidePress = true,
    placement = 'center',
    topOffset = 96,
    side,
    tabIndex = 0,
    ...props
  },
  ref,
) {
  const context = useDialogContext('DialogContent')
  const { width, height } = useWindowSize()
  if (!context.open) return null
  return (
    <anchored position={{ x: 0, y: 0 }} deferred priority={CONTENT_PRIORITY} occlude={false}>
      <div
        style={{ width, height, display: 'flex', pointerEvents: 'none', ...containerStyle(placement, topOffset, side) }}
      >
        <div
          {...props}
          ref={ref}
          tabIndex={tabIndex}
          autoFocus
          style={style}
          onMouseDownOutside={(event) => {
            onMouseDownOutside?.(event)
            onInteractOutside?.(event)
            if (dismissOnOutsidePress) context.setOpen(false)
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
        </div>
      </div>
    </anchored>
  )
})

export const DialogTitle = forwardRef<Instance, TextProps>(function DialogTitle(props, ref) {
  return <text {...props} ref={ref} />
})

export const DialogDescription = forwardRef<Instance, TextProps>(function DialogDescription(props, ref) {
  return <text {...props} ref={ref} />
})

export interface DialogCloseProps extends DivProps {
  asChild?: boolean
}

export const DialogClose = forwardRef<Instance, DialogCloseProps>(function DialogClose({ asChild, children, onClick, onKeyDown, ...props }, ref) {
  const context = useDialogContext('DialogClose')
  return renderSlot({
    asChild,
    children,
    ref,
    props: {
      ...props,
      tabIndex: asChild ? props.tabIndex : (props.tabIndex ?? 0),
      onClick: (event: EventPayload) => {
        onClick?.(event)
        context.setOpen(false)
      },
      onKeyDown: (event: EventPayload) => {
        onKeyDown?.(event)
        if (isActivationKey(event)) context.setOpen(false)
      },
    },
  })
})

export {
  Dialog as Root,
  DialogTrigger as Trigger,
  DialogOverlay as Overlay,
  DialogContent as Content,
  DialogTitle as Title,
  DialogDescription as Description,
  DialogClose as Close,
}
