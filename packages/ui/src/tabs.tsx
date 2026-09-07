import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { TabsPrimitive, type Instance } from '@gpuix-ui/primitives'
import { asText } from './internal'

export const Tabs = TabsPrimitive.Root
export const TabsContent = forwardRef<Instance, Omit<TabsPrimitive.TabsContentProps, 'style'> & { style?: Style }>(function TabsContent({ style, ...props }, ref) {
  return <TabsPrimitive.Content {...props} ref={ref} style={{ paddingTop: 10, ...style }} />
})

export const TabsList = forwardRef<Instance, { children?: ReactNode; style?: Style }>(function TabsList({ style, ...props }, ref) {
  const t = useTheme()
  return (
    <TabsPrimitive.List
      {...props}
      ref={ref}
      style={{ alignItems: 'center', gap: 2, padding: 3, borderRadius: t.radius.lg, backgroundColor: t.colors.muted, alignSelf: 'flex-start', userSelect: 'none', ...style }}
    />
  )
})

export interface TabsTriggerProps extends Omit<TabsPrimitive.TabsTriggerProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
}

export const TabsTrigger = forwardRef<Instance, TabsTriggerProps>(function TabsTrigger({ style, children, ...props }, ref) {
  const t = useTheme()
  return (
    <TabsPrimitive.Trigger
      {...props}
      ref={ref}
      style={(state) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 28,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: t.radius.md,
        cursor: state.disabled ? 'default' : 'pointer',
        opacity: state.disabled ? 0.5 : 1,
        backgroundColor: state.active ? t.colors.background : '#00000000',
        boxShadow: state.active ? t.shadow.sm : undefined,
        hover: state.active ? undefined : { backgroundColor: t.colors.overlay },
        ...style,
      })}
    >
      {(state) =>
        asText(children, {
          fontFamily: t.font.sans,
          fontSize: t.font.size.sm,
          fontWeight: 500,
          color: state.active ? t.colors.foreground : t.colors.mutedForeground,
          whiteSpace: 'nowrap',
        })
      }
    </TabsPrimitive.Trigger>
  )
})
