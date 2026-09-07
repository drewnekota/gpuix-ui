import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import { AccordionPrimitive, type Instance } from '@gpuix-ui/primitives'
import { Icon } from './icons'
import { asText } from './internal'

export const Accordion = AccordionPrimitive.Root

export interface AccordionItemProps extends Omit<AccordionPrimitive.AccordionItemProps, 'style'> {
  style?: Style
}

export const AccordionItem = forwardRef<Instance, AccordionItemProps>(function AccordionItem({ style, ...props }, ref) {
  const t = useTheme()
  return <AccordionPrimitive.Item {...props} ref={ref} style={{ borderBottomWidth: 1, borderColor: t.colors.border, ...style }} />
})

export interface AccordionTriggerProps extends Omit<AccordionPrimitive.AccordionTriggerProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
}

export const AccordionTrigger = forwardRef<Instance, AccordionTriggerProps>(function AccordionTrigger({ style, children, ...props }, ref) {
  const t = useTheme()
  return (
    <AccordionPrimitive.Trigger
      {...props}
      ref={ref}
      style={(state) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingTop: 14,
        paddingBottom: 14,
        cursor: state.disabled ? 'default' : 'pointer',
        opacity: state.disabled ? 0.5 : 1,
        userSelect: 'none',
        ...style,
      })}
    >
      {(state) => (
        <>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, flexGrow: 1, minWidth: 0 }}>
            {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.base, fontWeight: 500, color: t.colors.foreground })}
          </div>
          <Icon name={state.open ? 'chevronUp' : 'chevronDown'} size={16} color={t.colors.mutedForeground} />
        </>
      )}
    </AccordionPrimitive.Trigger>
  )
})

export const AccordionContent = forwardRef<Instance, { children?: ReactNode; style?: Style; forceMount?: boolean }>(function AccordionContent({ children, style, ...props }, ref) {
  const t = useTheme()
  return (
    <AccordionPrimitive.Content {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 16, ...style }}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.base, color: t.colors.mutedForeground })}
    </AccordionPrimitive.Content>
  )
})
