import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { DialogPrimitive, type Instance } from '@gpuix-ui/primitives'
import { Icon } from './icons'
import { Text, type TextProps } from './text'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export interface DialogContentProps extends Omit<DialogPrimitive.DialogContentProps, 'style'> {
  style?: Style
  /** Paint the dimmed backdrop. Default true. */
  overlay?: boolean
  overlayStyle?: Style
  /** Show the X button in the corner. Default true. */
  showClose?: boolean
  children?: ReactNode
}

export const DialogContent = forwardRef<Instance, DialogContentProps>(function DialogContent(
  { style, overlay = true, overlayStyle, showClose = true, children, ...props },
  ref,
) {
  const t = useTheme()
  return (
    <>
      {overlay ? <DialogPrimitive.Overlay style={{ backgroundColor: '#00000080', ...overlayStyle }} /> : null}
      <DialogPrimitive.Content
        {...props}
        ref={ref}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 512,
          maxWidth: '100%',
          padding: 24,
          borderRadius: t.radius.lg,
          borderWidth: 1,
          borderColor: t.colors.border,
          backgroundColor: t.colors.background,
          boxShadow: t.shadow.lg,
          ...style,
        }}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            testId="dialog-close"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 28,
              height: 28,
              borderRadius: t.radius.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0.7,
              hover: { backgroundColor: t.colors.accent, opacity: 1 },
            }}
          >
            <Icon name="x" size={16} color={t.colors.foreground} />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </>
  )
})

export function DialogHeader({ children, style }: { children?: ReactNode; style?: Style }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 24, ...style }}>{children}</div>
}

export function DialogFooter({ children, style }: { children?: ReactNode; style?: Style }) {
  return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, ...style }}>{children}</div>
}

export const DialogTitle = forwardRef<Instance, TextProps>(function DialogTitle(props, ref) {
  return <Text size="lg" weight="semibold" {...props} ref={ref} />
})

export const DialogDescription = forwardRef<Instance, TextProps>(function DialogDescription(props, ref) {
  return <Text size="sm" tone="muted" {...props} ref={ref} />
})
