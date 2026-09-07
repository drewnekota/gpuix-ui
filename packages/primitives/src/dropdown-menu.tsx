/**
 * Headless DropdownMenu: a Popover whose content owns a highlighted item and
 * keyboard navigation. Items register in mount order so Up/Down/Home/End walk
 * them without the menu knowing its own children.
 */
import React, { createContext, forwardRef, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { FloatingLayer, floatingRootStyle, type FloatingContentProps } from './floating'
import { Popover, PopoverTrigger, usePopoverContext, type PopoverTriggerProps } from './popover'
import { isActivationKey, useControllableState, useItemRegistry, useStableId, type DivProps, type Instance, type RegistryItem } from './internal'

interface MenuItemRecord extends RegistryItem {
  select: () => void
}

export interface MenuContextValue {
  highlightedId: string | null
  setHighlightedId: (id: string | null) => void
  register: (item: Omit<MenuItemRecord, 'order'>) => () => void
  step: (currentId: string | null, delta: number) => MenuItemRecord | undefined
  first: () => MenuItemRecord | undefined
  last: () => MenuItemRecord | undefined
  selectHighlighted: () => void
  close: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function useMenuContext(name: string): MenuContextValue {
  const context = useContext(MenuContext)
  if (!context) throw new Error(`${name} must be used inside DropdownMenu`)
  return context
}

export interface DropdownMenuProps extends Omit<DivProps, 'children'> {
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DropdownMenu({ children, style, ...props }: DropdownMenuProps): ReactElement {
  return (
    <Popover {...props} style={floatingRootStyle(style)}>
      <PopoverMenuProvider>{children}</PopoverMenuProvider>
    </Popover>
  )
}

function PopoverMenuProvider({ children }: { children?: ReactNode }) {
  const popover = usePopoverContext('DropdownMenu')
  return (
    <MenuProvider open={popover.open} close={() => popover.setOpen(false)}>
      {children}
    </MenuProvider>
  )
}

/** Owns the highlighted item and the item registry. Shared by DropdownMenu, ContextMenu, and Menubar. */
export function MenuProvider({ children, open, close }: { children?: ReactNode; open: boolean; close: () => void }) {
  const registry = useItemRegistry<MenuItemRecord>()
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const highlightedRef = useRef<string | null>(null)
  highlightedRef.current = highlightedId

  useLayoutEffect(() => {
    if (!open) setHighlightedId(null)
  }, [open])

  const context = useMemo<MenuContextValue>(
    () => ({
      highlightedId,
      setHighlightedId,
      register: registry.register,
      step: registry.step,
      first: () => registry.enabled()[0],
      last: () => registry.enabled().at(-1),
      selectHighlighted: () => {
        const id = highlightedRef.current
        if (!id) return
        registry.items.current.get(id)?.select()
      },
      close,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [highlightedId, open],
  )
  return <MenuContext.Provider value={context}>{children}</MenuContext.Provider>
}

/** The shared keyboard model: arrows, Home, End, Enter or Space, Escape. */
export function menuKeyDown(event: EventPayload, menu: MenuContextValue, close: () => void, onEscapeKeyDown?: (event: EventPayload) => void) {
  const ctrl = event.modifiers?.ctrl
  if (event.key === 'escape') {
    onEscapeKeyDown?.(event)
    close()
  } else if (event.key === 'down' || event.key === 'tab' || (event.key === 'n' && ctrl)) {
    menu.setHighlightedId(menu.step(menu.highlightedId, 1)?.id ?? null)
  } else if (event.key === 'up' || (event.key === 'p' && ctrl)) {
    menu.setHighlightedId(menu.step(menu.highlightedId, -1)?.id ?? null)
  } else if (event.key === 'home') {
    menu.setHighlightedId(menu.first()?.id ?? null)
  } else if (event.key === 'end') {
    menu.setHighlightedId(menu.last()?.id ?? null)
  } else if (isActivationKey(event)) {
    menu.selectHighlighted()
  }
}

export type DropdownMenuTriggerProps = PopoverTriggerProps
export const DropdownMenuTrigger = PopoverTrigger

export interface DropdownMenuContentProps extends FloatingContentProps {
  onEscapeKeyDown?: (event: EventPayload) => void
  /** Give the content its own keyboard highlight. Default true. */
  loop?: boolean
}

export const DropdownMenuContent = forwardRef<Instance, DropdownMenuContentProps>(function DropdownMenuContent(
  { children, onMouseDownOutside, onKeyDown, onEscapeKeyDown, tabIndex = 0, side = 'bottom', ...props },
  ref,
) {
  const popover = usePopoverContext('DropdownMenuContent')
  const menu = useMenuContext('DropdownMenuContent')
  if (!popover.open) return null
  return (
    <FloatingLayer
      {...props}
      side={side}
      ref={ref}
      tabIndex={tabIndex}
      autoFocus
      onMouseDownOutside={(event) => {
        onMouseDownOutside?.(event)
        popover.dismissedByOutsidePress.current = true
        queueMicrotask(() => {
          popover.dismissedByOutsidePress.current = false
        })
        popover.setOpen(false)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        menuKeyDown(event, menu, () => popover.setOpen(false), onEscapeKeyDown)
      }}
    >
      {children}
    </FloatingLayer>
  )
})

export interface DropdownMenuItemState {
  highlighted: boolean
  disabled: boolean
}

export interface DropdownMenuItemProps extends Omit<DivProps, 'children' | 'style'> {
  disabled?: boolean
  /** Fires on click or Enter. The menu closes afterwards unless `closeOnSelect` is false. */
  onSelect?: () => void
  closeOnSelect?: boolean
  children?: ReactNode | ((state: DropdownMenuItemState) => ReactNode)
  style?: StateStyle<DropdownMenuItemState>
}

export const DropdownMenuItem = forwardRef<Instance, DropdownMenuItemProps>(function DropdownMenuItem(
  { disabled = false, onSelect, closeOnSelect = true, children, style, onClick, onMouseEnter, onMouseLeave, ...props },
  ref,
) {
  const menu = useMenuContext('DropdownMenuItem')
  const id = useStableId('menu-item')
  const select = () => {
    if (disabled) return
    onSelect?.()
    if (closeOnSelect) menu.close()
  }
  const selectRef = useRef(select)
  selectRef.current = select
  useLayoutEffect(
    () => menu.register({ id, disabled, select: () => selectRef.current() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, disabled],
  )
  const state: DropdownMenuItemState = { highlighted: menu.highlightedId === id, disabled }
  return (
    <div
      {...props}
      ref={ref}
      style={resolveStyle(style, state)}
      onMouseEnter={(event) => {
        onMouseEnter?.(event)
        if (!disabled) menu.setHighlightedId(id)
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event)
        if (menu.highlightedId === id) menu.setHighlightedId(null)
      }}
      onClick={(event) => {
        onClick?.(event)
        select()
      }}
    >
      {typeof children === 'function' ? children(state) : children}
    </div>
  )
})

const ItemIndicatorContext = createContext<boolean>(false)

export interface DropdownMenuCheckboxItemProps extends Omit<DropdownMenuItemProps, 'onSelect'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const DropdownMenuCheckboxItem = forwardRef<Instance, DropdownMenuCheckboxItemProps>(function DropdownMenuCheckboxItem(
  { checked: checkedProp, defaultChecked = false, onCheckedChange, children, ...props },
  ref,
) {
  const [checked, setChecked] = useControllableState({ value: checkedProp, defaultValue: defaultChecked, onChange: onCheckedChange })
  return (
    <ItemIndicatorContext.Provider value={checked}>
      <DropdownMenuItem {...props} ref={ref} onSelect={() => setChecked(!checked)}>
        {children}
      </DropdownMenuItem>
    </ItemIndicatorContext.Provider>
  )
})

interface RadioGroupContextValue {
  value: string | undefined
  setValue: (value: string) => void
}
const MenuRadioContext = createContext<RadioGroupContextValue | null>(null)

export interface DropdownMenuRadioGroupProps extends Omit<DivProps, 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export const DropdownMenuRadioGroup = forwardRef<Instance, DropdownMenuRadioGroupProps>(function DropdownMenuRadioGroup(
  { value: valueProp, defaultValue, onValueChange, children, ...props },
  ref,
) {
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  })
  return (
    <MenuRadioContext.Provider value={{ value, setValue }}>
      <div {...props} ref={ref}>
        {children}
      </div>
    </MenuRadioContext.Provider>
  )
})

export interface DropdownMenuRadioItemProps extends Omit<DropdownMenuItemProps, 'onSelect'> {
  value: string
}

export const DropdownMenuRadioItem = forwardRef<Instance, DropdownMenuRadioItemProps>(function DropdownMenuRadioItem({ value, children, ...props }, ref) {
  const group = useContext(MenuRadioContext)
  if (!group) throw new Error('DropdownMenuRadioItem must be used inside DropdownMenuRadioGroup')
  return (
    <ItemIndicatorContext.Provider value={group.value === value}>
      <DropdownMenuItem {...props} ref={ref} onSelect={() => group.setValue(value)}>
        {children}
      </DropdownMenuItem>
    </ItemIndicatorContext.Provider>
  )
})

/** Renders its children only when the enclosing checkbox or radio item is checked. */
export const DropdownMenuItemIndicator = forwardRef<Instance, DivProps & { forceMount?: boolean }>(function DropdownMenuItemIndicator(
  { forceMount, children, ...props },
  ref,
) {
  const checked = useContext(ItemIndicatorContext)
  if (!checked && !forceMount) return null
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  )
})

export const DropdownMenuGroup = forwardRef<Instance, DivProps>(function DropdownMenuGroup(props, ref) {
  return <div {...props} ref={ref} />
})
export const DropdownMenuLabel = forwardRef<Instance, DivProps>(function DropdownMenuLabel(props, ref) {
  return <div {...props} ref={ref} />
})
export const DropdownMenuSeparator = forwardRef<Instance, DivProps>(function DropdownMenuSeparator(props, ref) {
  return <div {...props} ref={ref} />
})

export {
  DropdownMenu as Root,
  DropdownMenuTrigger as Trigger,
  DropdownMenuContent as Content,
  DropdownMenuItem as Item,
  DropdownMenuCheckboxItem as CheckboxItem,
  DropdownMenuRadioGroup as RadioGroup,
  DropdownMenuRadioItem as RadioItem,
  DropdownMenuItemIndicator as ItemIndicator,
  DropdownMenuGroup as Group,
  DropdownMenuLabel as Label,
  DropdownMenuSeparator as Separator,
}
