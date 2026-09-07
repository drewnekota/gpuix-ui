/** Command palette, cmdk-shaped, over the gpuix-ui Command primitive. */
import React, { createContext, forwardRef, useContext, type ReactNode } from 'react'
import { toGpuixTheme, useTheme, type Style } from '@gpuix-ui/core'
import { CommandPrimitive, DialogPrimitive, useControllableState, type Instance } from '@gpuix-ui/primitives'
import { Icon } from './icons'
import { asText } from './internal'

export interface CommandProps extends Omit<CommandPrimitive.CommandProps, 'style'> {
  style?: Style
}

export const Command = forwardRef<Instance, CommandProps>(function Command({ style, ...props }, ref) {
  const t = useTheme()
  return (
    <CommandPrimitive.Root
      {...props}
      ref={ref}
      style={{
        width: '100%',
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.popover,
        overflow: 'hidden',
        ...style,
      }}
    />
  )
})

export interface CommandInputProps extends Omit<CommandPrimitive.CommandInputProps, 'style'> {
  style?: Style
  inputStyle?: Style
}

export const CommandInput = forwardRef<Instance, CommandInputProps>(function CommandInput({ style, inputStyle, placeholder = 'Type a command or search…', theme, ...props }, ref) {
  const t = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingLeft: 12, paddingRight: 12, borderBottomWidth: 1, borderColor: t.colors.border, ...style }}>
      <Icon name="search" size={16} color={t.colors.mutedForeground} />
      <CommandPrimitive.Input
        {...props}
        ref={ref}
        placeholder={placeholder}
        theme={theme ?? toGpuixTheme(t)}
        style={{ flexGrow: 1, minWidth: 0, fontFamily: t.font.sans, fontSize: t.font.size.sm, color: t.colors.foreground, ...inputStyle }}
      />
    </div>
  )
})

export const CommandList = forwardRef<Instance, { children?: ReactNode; style?: Style }>(function CommandList({ style, ...props }, ref) {
  return <CommandPrimitive.List {...props} ref={ref} style={{ maxHeight: 320, overflowY: 'scroll', padding: 4, ...style }} />
})

export const CommandEmpty = forwardRef<Instance, { children?: ReactNode; style?: Style }>(function CommandEmpty({ children, style }, ref) {
  const t = useTheme()
  return (
    <CommandPrimitive.Empty ref={ref} style={{ display: 'flex', justifyContent: 'center', paddingTop: 24, paddingBottom: 24, ...style }}>
      {asText(children ?? 'No results found.', { fontFamily: t.font.sans, fontSize: t.font.size.sm, color: t.colors.mutedForeground })}
    </CommandPrimitive.Empty>
  )
})

export interface CommandGroupProps extends Omit<CommandPrimitive.CommandGroupProps, 'style' | 'heading'> {
  heading?: ReactNode
  style?: Style
}

function GroupHeading({ children }: { children: ReactNode }) {
  const t = useTheme()
  const visible = CommandPrimitive.useCommandGroupVisible()
  if (!visible) return null
  return <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 4 }}>{asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.xs, fontWeight: 500, color: t.colors.mutedForeground })}</div>
}

export const CommandGroup = forwardRef<Instance, CommandGroupProps>(function CommandGroup({ heading, children, style, ...props }, ref) {
  return (
    <CommandPrimitive.Group {...props} ref={ref} style={{ paddingBottom: 4, ...style }}>
      {heading ? <GroupHeading>{heading}</GroupHeading> : null}
      {children}
    </CommandPrimitive.Group>
  )
})

/** Set by CommandDialog so items can close it after a selection. */
const CommandDialogContext = createContext<((open: boolean) => void) | null>(null)

export interface CommandItemProps extends Omit<CommandPrimitive.CommandItemProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
  shortcut?: string
  /** Inside a CommandDialog, close it after this item is selected. Default true. */
  closeOnSelect?: boolean
}

export const CommandItem = forwardRef<Instance, CommandItemProps>(function CommandItem({ style, children, shortcut, closeOnSelect = true, onSelect, ...props }, ref) {
  const t = useTheme()
  const setDialogOpen = useContext(CommandDialogContext)
  return (
    <CommandPrimitive.Item
      {...props}
      ref={ref}
      onSelect={(value) => {
        onSelect?.(value)
        if (closeOnSelect) setDialogOpen?.(false)
      }}
      style={(state) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 34,
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: t.radius.sm,
        cursor: state.disabled ? 'default' : 'pointer',
        opacity: state.disabled ? 0.5 : 1,
        backgroundColor: state.highlighted ? t.colors.accent : t.colors.popover,
        ...style,
      })}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, flexGrow: 1, minWidth: 0 }}>
        {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.sm + 2, color: t.colors.popoverForeground })}
      </div>
      {shortcut ? <CommandShortcut>{shortcut}</CommandShortcut> : null}
    </CommandPrimitive.Item>
  )
})

export function CommandShortcut({ children, style }: { children?: ReactNode; style?: Style }) {
  const t = useTheme()
  return <text style={{ fontFamily: t.font.sans, fontSize: t.font.size.xs, color: t.colors.mutedForeground, ...style }}>{children}</text>
}

export const CommandSeparator = forwardRef<Instance, { style?: Style }>(function CommandSeparator({ style }, ref) {
  const t = useTheme()
  return <CommandPrimitive.Separator ref={ref} style={{ height: 1, marginTop: 4, marginBottom: 4, marginLeft: -4, marginRight: -4, backgroundColor: t.colors.border, ...style }} />
})

export interface CommandDialogProps extends CommandProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Panel width. */
  width?: number
  topOffset?: number
}

/** A Command inside a top-anchored Dialog. Escape and an outside press close it. */
export const CommandDialog = forwardRef<Instance, CommandDialogProps>(function CommandDialog({ open, defaultOpen, onOpenChange, width = 560, topOffset = 96, children, style, ...props }, ref) {
  const t = useTheme()
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen ?? false, onChange: onOpenChange })
  return (
    <CommandDialogContext.Provider value={setOpen}>
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <DialogPrimitive.Overlay style={{ backgroundColor: t.appearance === 'dark' ? '#00000099' : '#00000055' }} />
      <DialogPrimitive.Content placement="top" topOffset={topOffset} style={{ width, maxWidth: '100%', boxShadow: t.shadow.lg, borderRadius: t.radius.lg }}>
        <Command {...props} ref={ref} style={style}>
          {children}
        </Command>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
    </CommandDialogContext.Provider>
  )
})
