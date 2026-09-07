/** A Dialog that does not close on an outside press and has no corner X. */
import React, { forwardRef } from 'react'
import { DialogPrimitive, type Instance } from '@gpuix-ui/primitives'
import { Button, type ButtonProps } from './button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, type DialogContentProps } from './dialog'

export const AlertDialog = DialogPrimitive.Root
export const AlertDialogTrigger = DialogPrimitive.Trigger
export const AlertDialogHeader = DialogHeader
export const AlertDialogFooter = DialogFooter
export const AlertDialogTitle = DialogTitle
export const AlertDialogDescription = DialogDescription

export const AlertDialogContent = forwardRef<Instance, DialogContentProps>(function AlertDialogContent(props, ref) {
  return <DialogContent {...props} ref={ref} dismissOnOutsidePress={false} showClose={false} />
})

export const AlertDialogAction = forwardRef<Instance, ButtonProps>(function AlertDialogAction(props, ref) {
  return (
    <DialogPrimitive.Close asChild>
      <Button {...props} ref={ref} />
    </DialogPrimitive.Close>
  )
})

export const AlertDialogCancel = forwardRef<Instance, ButtonProps>(function AlertDialogCancel(props, ref) {
  return (
    <DialogPrimitive.Close asChild>
      <Button variant="outline" {...props} ref={ref} />
    </DialogPrimitive.Close>
  )
})
