/** Right-click menu. Items are the DropdownMenu ones; only the trigger and the layer differ. */
import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { ContextMenuPrimitive, type Instance } from '@gpuix-ui/primitives'

export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger

export interface ContextMenuContentProps extends Omit<ContextMenuPrimitive.ContextMenuContentProps, 'style'> {
  style?: Style
}

export const ContextMenuContent = forwardRef<Instance, ContextMenuContentProps>(function ContextMenuContent({ style, ...props }, ref) {
  const t = useTheme()
  return (
    <ContextMenuPrimitive.Content
      {...props}
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 180,
        padding: 4,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.popover,
        boxShadow: t.shadow.md,
        userSelect: 'none',
        ...style,
      }}
    />
  )
})

export {
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  DropdownMenuRadioGroup as ContextMenuRadioGroup,
  DropdownMenuRadioItem as ContextMenuRadioItem,
  DropdownMenuGroup as ContextMenuGroup,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuShortcut as ContextMenuShortcut,
} from './dropdown-menu'
