/**
 * Headless Menubar: a row of DropdownMenus where hovering another trigger
 * while one menu is open switches to it, like a native menu bar.
 */
import React, { createContext, forwardRef, useContext, useMemo, type ReactElement, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { DropdownMenu, DropdownMenuTrigger, type DropdownMenuProps, type DropdownMenuTriggerProps } from './dropdown-menu'
import { useControllableState, useStableId, type DivProps, type Instance } from './internal'

interface MenubarContextValue {
  openValue: string | null
  setOpenValue: (value: string | null) => void
}

const MenubarContext = createContext<MenubarContextValue | null>(null)

function useMenubarContext(name: string): MenubarContextValue {
  const context = useContext(MenubarContext)
  if (!context) throw new Error(`${name} must be used inside Menubar`)
  return context
}

export interface MenubarProps extends Omit<DivProps, 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | null) => void
}

export const Menubar = forwardRef<Instance, MenubarProps>(function Menubar({ value: valueProp, defaultValue, onValueChange, children, style, ...props }, ref) {
  const [openValue, setOpenValue] = useControllableState<string | null>({
    value: valueProp === undefined ? undefined : valueProp || null,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  })
  const context = useMemo<MenubarContextValue>(() => ({ openValue, setOpenValue }), [openValue, setOpenValue])
  return (
    <MenubarContext.Provider value={context}>
      <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', ...style }}>
        {children}
      </div>
    </MenubarContext.Provider>
  )
})

const MenuValueContext = createContext<string>('')

export interface MenubarMenuProps extends Omit<DropdownMenuProps, 'open' | 'defaultOpen' | 'onOpenChange'> {
  /** Identifies this menu in the bar. Defaults to a generated id. */
  value?: string
}

export function MenubarMenu({ value: valueProp, children, ...props }: MenubarMenuProps): ReactElement {
  const bar = useMenubarContext('MenubarMenu')
  const generated = useStableId('menubar-menu')
  const value = valueProp ?? generated
  return (
    <MenuValueContext.Provider value={value}>
      <DropdownMenu {...props} open={bar.openValue === value} onOpenChange={(open) => bar.setOpenValue(open ? value : bar.openValue === value ? null : bar.openValue)}>
        {children}
      </DropdownMenu>
    </MenuValueContext.Provider>
  )
}

export const MenubarTrigger = forwardRef<Instance, DropdownMenuTriggerProps>(function MenubarTrigger({ onMouseEnter, ...props }, ref) {
  const bar = useMenubarContext('MenubarTrigger')
  const value = useContext(MenuValueContext)
  return (
    <DropdownMenuTrigger
      {...props}
      ref={ref}
      onMouseEnter={(event: EventPayload) => {
        onMouseEnter?.(event)
        if (bar.openValue !== null && bar.openValue !== value) bar.setOpenValue(value)
      }}
    />
  )
})

export {
  DropdownMenuContent as MenubarContent,
  DropdownMenuItem as MenubarItem,
  DropdownMenuCheckboxItem as MenubarCheckboxItem,
  DropdownMenuRadioGroup as MenubarRadioGroup,
  DropdownMenuRadioItem as MenubarRadioItem,
  DropdownMenuItemIndicator as MenubarItemIndicator,
  DropdownMenuGroup as MenubarGroup,
  DropdownMenuLabel as MenubarLabel,
  DropdownMenuSeparator as MenubarSeparator,
} from './dropdown-menu'

export { Menubar as Root, MenubarMenu as Menu, MenubarTrigger as Trigger }
