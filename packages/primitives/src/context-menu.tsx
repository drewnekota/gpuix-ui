/**
 * Headless ContextMenu: a right-click opens a menu at the pointer.
 *
 * `<anchored position>` is window-absolute and the click event carries window
 * coordinates, so the menu lands under the pointer without measuring anything.
 * Items, groups, labels, and separators are the DropdownMenu ones.
 */
import React, { createContext, forwardRef, useContext, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { mergeStyle } from '@gpuix-ui/core'
import { MenuProvider, menuKeyDown, useMenuContext } from './dropdown-menu'
import { renderSlot, useControllableState, useFocusElement, type DivProps, type Instance } from './internal'

interface ContextMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  position: { x: number; y: number }
  openAt: (x: number, y: number) => void
  triggerRef: React.MutableRefObject<Instance | null>
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

function useContextMenuContext(name: string): ContextMenuContextValue {
  const context = useContext(ContextMenuContext)
  if (!context) throw new Error(`${name} must be used inside ContextMenu`)
  return context
}

export interface ContextMenuProps {
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ContextMenu({ children, open: openProp, onOpenChange }: ContextMenuProps): ReactElement {
  const focus = useFocusElement()
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: false, onChange: onOpenChange })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<Instance | null>(null)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    if (!next) focus(triggerRef.current)
  }
  const context = useMemo<ContextMenuContextValue>(
    () => ({
      open,
      setOpen,
      position,
      openAt: (x, y) => {
        setPosition({ x, y })
        setOpenState(true)
      },
      triggerRef,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, position],
  )
  return (
    <ContextMenuContext.Provider value={context}>
      <MenuProvider open={open} close={() => setOpen(false)}>
        {children}
      </MenuProvider>
    </ContextMenuContext.Provider>
  )
}

export interface ContextMenuTriggerProps extends DivProps {
  asChild?: boolean
  disabled?: boolean
}

/** The area that answers a right click. Renders a `div` unless `asChild`. */
export const ContextMenuTrigger = forwardRef<Instance, ContextMenuTriggerProps>(function ContextMenuTrigger(
  { asChild, disabled = false, children, onAuxClick, onMouseDown, ...props },
  forwardedRef,
) {
  const context = useContextMenuContext('ContextMenuTrigger')
  const ref = (value: Instance | null) => {
    context.triggerRef.current = value
    if (typeof forwardedRef === 'function') forwardedRef(value)
    else if (forwardedRef) forwardedRef.current = value
  }
  return renderSlot({
    asChild,
    children,
    ref,
    props: {
      ...props,
      onMouseDown: (event: EventPayload) => {
        onMouseDown?.(event)
        if (!disabled && event.button === 2) context.openAt(event.x ?? 0, event.y ?? 0)
      },
      onAuxClick: (event: EventPayload) => {
        onAuxClick?.(event)
        if (!disabled && event.isRightClick && !context.open) context.openAt(event.x ?? 0, event.y ?? 0)
      },
    },
  })
})

export interface ContextMenuContentProps extends Omit<DivProps, 'children'> {
  children?: ReactNode
  onEscapeKeyDown?: (event: EventPayload) => void
  /** Paint order among floating layers. */
  priority?: number
}

export const ContextMenuContent = forwardRef<Instance, ContextMenuContentProps>(function ContextMenuContent(
  { children, style, tabIndex = 0, priority = 1, onMouseDownOutside, onKeyDown, onEscapeKeyDown, ...props },
  ref,
) {
  const context = useContextMenuContext('ContextMenuContent')
  const menu = useMenuContext('ContextMenuContent')
  if (!context.open) return null
  return (
    <anchored position={context.position} deferred priority={priority} occlude fit="snap" snapMargin={8} style={{ backgroundColor: style?.backgroundColor ?? '#1A1A1A', borderRadius: style?.borderRadius }}>
      <div
        {...props}
        ref={ref}
        tabIndex={tabIndex}
        autoFocus
        style={mergeStyle({ backgroundColor: '#1A1A1A' }, style)}
        onMouseDownOutside={(event) => {
          onMouseDownOutside?.(event)
          context.setOpen(false)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          menuKeyDown(event, menu, () => context.setOpen(false), onEscapeKeyDown)
        }}
      >
        {children}
      </div>
    </anchored>
  )
})

export {
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  DropdownMenuRadioGroup as ContextMenuRadioGroup,
  DropdownMenuRadioItem as ContextMenuRadioItem,
  DropdownMenuItemIndicator as ContextMenuItemIndicator,
  DropdownMenuGroup as ContextMenuGroup,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuSeparator as ContextMenuSeparator,
} from './dropdown-menu'

export { ContextMenu as Root, ContextMenuTrigger as Trigger, ContextMenuContent as Content }
