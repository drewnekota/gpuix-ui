import React, { forwardRef, type ReactNode } from 'react'
import * as TooltipPrimitive from '@gpuix/react/tooltip'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { Instance } from '@gpuix-ui/primitives'
import { asText } from './internal'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export interface TooltipContentProps extends Omit<TooltipPrimitive.TooltipContentProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
}

export const TooltipContent = forwardRef<Instance, TooltipContentProps>(function TooltipContent(
  { side = 'top', sideOffset = 6, style, children, ...props },
  ref,
) {
  const t = useTheme()
  return (
    <TooltipPrimitive.Content
      {...props}
      ref={ref}
      side={side}
      sideOffset={sideOffset}
      style={{
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: t.radius.md,
        backgroundColor: t.colors.primary,
        boxShadow: t.shadow.md,
        ...style,
      }}
    >
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.xs, lineHeight: t.font.lineHeight.xs, color: t.colors.primaryForeground, whiteSpace: 'nowrap' })}
    </TooltipPrimitive.Content>
  )
})
