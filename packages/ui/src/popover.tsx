import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { PopoverPrimitive, type Instance } from '@gpuix-ui/primitives'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverClose = PopoverPrimitive.Close

export interface PopoverContentProps extends Omit<PopoverPrimitive.PopoverContentProps, 'style'> {
  style?: Style
}

export const PopoverContent = forwardRef<Instance, PopoverContentProps>(function PopoverContent({ style, sideOffset = 6, ...props }, ref) {
  const t = useTheme()
  return (
    <PopoverPrimitive.Content
      {...props}
      ref={ref}
      sideOffset={sideOffset}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 280,
        padding: 16,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.popover,
        boxShadow: t.shadow.md,
        ...style,
      }}
    />
  )
})
