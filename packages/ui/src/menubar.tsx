import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { MenubarPrimitive, type DropdownMenuTriggerProps, type Instance } from '@gpuix-ui/primitives'
import { DropdownMenuContent, type DropdownMenuContentProps } from './dropdown-menu'
import { asText } from './internal'

export const MenubarMenu = MenubarPrimitive.Menu

export const Menubar = forwardRef<Instance, Omit<MenubarPrimitive.MenubarProps, 'style'> & { style?: Style }>(function Menubar({ style, ...props }, ref) {
  const t = useTheme()
  return (
    <MenubarPrimitive.Root
      {...props}
      ref={ref}
      style={{ gap: 2, padding: 3, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.background, alignSelf: 'flex-start', userSelect: 'none', ...style }}
    />
  )
})

export interface MenubarTriggerProps extends Omit<DropdownMenuTriggerProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
}

export const MenubarTrigger = forwardRef<Instance, MenubarTriggerProps>(function MenubarTrigger({ style, children, ...props }, ref) {
  const t = useTheme()
  return (
    <MenubarPrimitive.Trigger
      {...props}
      ref={ref}
      style={(state) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 28,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: t.radius.sm,
        cursor: 'pointer',
        backgroundColor: state.open ? t.colors.accent : '#00000000',
        hover: { backgroundColor: t.colors.accent },
        ...style,
      })}
    >
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, fontWeight: 500, color: t.colors.foreground, whiteSpace: 'nowrap' })}
    </MenubarPrimitive.Trigger>
  )
})

export const MenubarContent = forwardRef<Instance, DropdownMenuContentProps>(function MenubarContent({ sideOffset = 6, align = 'start', ...props }, ref) {
  return <DropdownMenuContent {...props} ref={ref} sideOffset={sideOffset} align={align} />
})

export {
  DropdownMenuItem as MenubarItem,
  DropdownMenuCheckboxItem as MenubarCheckboxItem,
  DropdownMenuRadioGroup as MenubarRadioGroup,
  DropdownMenuRadioItem as MenubarRadioItem,
  DropdownMenuGroup as MenubarGroup,
  DropdownMenuLabel as MenubarLabel,
  DropdownMenuSeparator as MenubarSeparator,
  DropdownMenuShortcut as MenubarShortcut,
} from './dropdown-menu'
