import React, { forwardRef } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'
import { Text, type TextProps } from './text'

export interface CardProps extends Omit<DivProps, 'style'> {
  style?: Style
}

export const Card = forwardRef<Instance, CardProps>(function Card({ style, ...props }, ref) {
  const t = useTheme()
  return (
    <div
      {...props}
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        paddingTop: 20,
        paddingBottom: 20,
        borderRadius: t.radius.xl,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.card,
        boxShadow: t.shadow.sm,
        ...style,
      }}
    />
  )
})

export const CardHeader = forwardRef<Instance, CardProps>(function CardHeader({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 20, paddingRight: 20, ...style }} />
})

export const CardTitle = forwardRef<Instance, TextProps>(function CardTitle(props, ref) {
  return <Text size="lg" weight="semibold" {...props} ref={ref} />
})

export const CardDescription = forwardRef<Instance, TextProps>(function CardDescription(props, ref) {
  return <Text size="sm" tone="muted" {...props} ref={ref} />
})

export const CardContent = forwardRef<Instance, CardProps>(function CardContent({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 20, paddingRight: 20, ...style }} />
})

export const CardFooter = forwardRef<Instance, CardProps>(function CardFooter({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 20, paddingRight: 20, ...style }} />
})
