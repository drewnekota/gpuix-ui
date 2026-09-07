/** A Dialog docked to a window edge. */
import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { DialogPrimitive, type Instance } from '@gpuix-ui/primitives'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Icon } from './icons'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetHeader = DialogHeader
export const SheetFooter = DialogFooter
export const SheetTitle = DialogTitle
export const SheetDescription = DialogDescription

export interface SheetContentProps extends Omit<DialogPrimitive.DialogContentProps, 'style' | 'side' | 'placement'> {
  side?: 'left' | 'right' | 'top' | 'bottom'
  style?: Style
  overlay?: boolean
  overlayStyle?: Style
  showClose?: boolean
  /** Width for left/right, height for top/bottom. */
  size?: number
  children?: ReactNode
}

export const SheetContent = forwardRef<Instance, SheetContentProps>(function SheetContent(
  { side = 'right', style, overlay = true, overlayStyle, showClose = true, size, children, ...props },
  ref,
) {
  const t = useTheme()
  const horizontal = side === 'left' || side === 'right'
  const edgeBorder =
    side === 'right' ? { borderLeftWidth: 1 } : side === 'left' ? { borderRightWidth: 1 } : side === 'top' ? { borderBottomWidth: 1 } : { borderTopWidth: 1 }
  return (
    <>
      {overlay ? <DialogPrimitive.Overlay style={{ backgroundColor: '#00000080', ...overlayStyle }} /> : null}
      <DialogPrimitive.Content
        {...props}
        ref={ref}
        side={side}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          ...(horizontal ? { width: size ?? 400, maxWidth: '100%' } : { height: size ?? 320, maxHeight: '100%' }),
          padding: 24,
          borderColor: t.colors.border,
          backgroundColor: t.colors.background,
          boxShadow: t.shadow.lg,
          ...edgeBorder,
          ...style,
        }}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            testId="sheet-close"
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
