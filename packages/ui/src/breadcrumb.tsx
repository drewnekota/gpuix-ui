import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'
import { Icon } from './icons'
import { asText } from './internal'

export interface BreadcrumbProps extends Omit<DivProps, 'style'> {
  style?: Style
}

export const Breadcrumb = forwardRef<Instance, BreadcrumbProps>(function Breadcrumb({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, userSelect: 'none', ...style }} />
})

export const BreadcrumbList = Breadcrumb

export const BreadcrumbItem = forwardRef<Instance, BreadcrumbProps>(function BreadcrumbItem({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, ...style }} />
})

export interface BreadcrumbLinkProps extends Omit<DivProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
}

export const BreadcrumbLink = forwardRef<Instance, BreadcrumbLinkProps>(function BreadcrumbLink({ style, children, ...props }, ref) {
  const t = useTheme()
  return (
    <div {...props} ref={ref} tabIndex={props.tabIndex ?? 0} style={{ cursor: 'pointer', borderRadius: t.radius.sm, hover: { opacity: 0.8 }, ...style }}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, color: t.colors.mutedForeground })}
    </div>
  )
})

export const BreadcrumbPage = forwardRef<Instance, BreadcrumbLinkProps>(function BreadcrumbPage({ style, children, ...props }, ref) {
  const t = useTheme()
  return (
    <div {...props} ref={ref} style={style}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, fontWeight: 500, color: t.colors.foreground })}
    </div>
  )
})

export function BreadcrumbSeparator({ children, style }: { children?: ReactNode; style?: Style }) {
  const t = useTheme()
  return <div style={{ display: 'flex', alignItems: 'center', ...style }}>{children ?? <Icon name="chevronRight" size={14} color={t.colors.mutedForeground} />}</div>
}

export function BreadcrumbEllipsis({ style }: { style?: Style }) {
  const t = useTheme()
  return (
    <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <Icon name="ellipsis" size={16} color={t.colors.mutedForeground} />
    </div>
  )
}
