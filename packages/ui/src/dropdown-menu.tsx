import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, withAlpha, type Style } from '@gpuix-ui/core'
import { DropdownMenuPrimitive, type Instance } from '@gpuix-ui/primitives'
import { Icon } from './icons'
import { asText } from './internal'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export interface DropdownMenuContentProps extends Omit<DropdownMenuPrimitive.DropdownMenuContentProps, 'style'> {
  style?: Style
}

export const DropdownMenuContent = forwardRef<Instance, DropdownMenuContentProps>(function DropdownMenuContent(
  { style, sideOffset = 4, ...props },
  ref,
) {
  const t = useTheme()
  return (
    <DropdownMenuPrimitive.Content
      {...props}
      ref={ref}
      sideOffset={sideOffset}
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

export interface DropdownMenuItemProps extends Omit<DropdownMenuPrimitive.DropdownMenuItemProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
  /** Indent to line up with items that carry a check or radio indicator. */
  inset?: boolean
  variant?: 'default' | 'destructive'
  /** Trailing hint such as a keyboard shortcut. */
  shortcut?: string
}

function useItemStyle(t: ReturnType<typeof useTheme>, variant: 'default' | 'destructive', inset: boolean, style?: Style) {
  return (state: DropdownMenuPrimitive.DropdownMenuItemState): Style => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
    paddingLeft: inset ? 32 : 8,
    paddingRight: 8,
    borderRadius: t.radius.sm,
    cursor: state.disabled ? 'default' : 'pointer',
    opacity: state.disabled ? 0.5 : 1,
    backgroundColor: state.highlighted ? (variant === 'destructive' ? withAlpha(t.colors.destructive, 0.15) : t.colors.accent) : t.colors.popover,
    ...style,
  })
}

export const DropdownMenuItem = forwardRef<Instance, DropdownMenuItemProps>(function DropdownMenuItem(
  { style, children, inset = false, variant = 'default', shortcut, ...props },
  ref,
) {
  const t = useTheme()
  const color = variant === 'destructive' ? t.colors.destructive : t.colors.popoverForeground
  return (
    <DropdownMenuPrimitive.Item {...props} ref={ref} style={useItemStyle(t, variant, inset, style)}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, flexGrow: 1, minWidth: 0 }}>
        {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.sm, color })}
      </div>
      {shortcut ? <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut> : null}
    </DropdownMenuPrimitive.Item>
  )
})

export interface DropdownMenuCheckboxItemProps extends Omit<DropdownMenuPrimitive.DropdownMenuCheckboxItemProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
}

export const DropdownMenuCheckboxItem = forwardRef<Instance, DropdownMenuCheckboxItemProps>(function DropdownMenuCheckboxItem(
  { style, children, ...props },
  ref,
) {
  const t = useTheme()
  return (
    <DropdownMenuPrimitive.CheckboxItem {...props} ref={ref} style={useItemStyle(t, 'default', true, style)}>
      <DropdownMenuPrimitive.ItemIndicator style={{ position: 'absolute', left: 10, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <Icon name="check" size={14} color={t.colors.popoverForeground} />
      </DropdownMenuPrimitive.ItemIndicator>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.sm, color: t.colors.popoverForeground })}
    </DropdownMenuPrimitive.CheckboxItem>
  )
})

export interface DropdownMenuRadioItemProps extends Omit<DropdownMenuPrimitive.DropdownMenuRadioItemProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
}

export const DropdownMenuRadioItem = forwardRef<Instance, DropdownMenuRadioItemProps>(function DropdownMenuRadioItem({ style, children, ...props }, ref) {
  const t = useTheme()
  return (
    <DropdownMenuPrimitive.RadioItem {...props} ref={ref} style={useItemStyle(t, 'default', true, style)}>
      <DropdownMenuPrimitive.ItemIndicator style={{ position: 'absolute', left: 10, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <Icon name="dot" size={14} color={t.colors.popoverForeground} />
      </DropdownMenuPrimitive.ItemIndicator>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.sm, color: t.colors.popoverForeground })}
    </DropdownMenuPrimitive.RadioItem>
  )
})

export const DropdownMenuLabel = forwardRef<Instance, { children?: ReactNode; style?: Style; inset?: boolean }>(function DropdownMenuLabel(
  { children, style, inset },
  ref,
) {
  const t = useTheme()
  return (
    <DropdownMenuPrimitive.Label ref={ref} style={{ paddingLeft: inset ? 32 : 8, paddingRight: 8, paddingTop: 6, paddingBottom: 4, ...style }}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.xs, fontWeight: 500, color: t.colors.mutedForeground })}
    </DropdownMenuPrimitive.Label>
  )
})

export const DropdownMenuSeparator = forwardRef<Instance, { style?: Style }>(function DropdownMenuSeparator({ style }, ref) {
  const t = useTheme()
  return <DropdownMenuPrimitive.Separator ref={ref} style={{ height: 1, marginTop: 4, marginBottom: 4, marginLeft: -4, marginRight: -4, backgroundColor: t.colors.border, ...style }} />
})

export function DropdownMenuShortcut({ children, style }: { children?: ReactNode; style?: Style }) {
  const t = useTheme()
  return <text style={{ fontFamily: t.font.sans, fontSize: t.font.size.xs, color: t.colors.mutedForeground, ...style }}>{children}</text>
}
