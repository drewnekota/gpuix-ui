/**
 * Table built from flex rows. GPUI has no table layout, so columns line up by
 * giving every cell in a column the same `width`, or by letting all cells share
 * the row equally (the default: `flexGrow: 1, flexBasis: 0`).
 */
import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'
import { asText } from './internal'

export interface TableProps extends Omit<DivProps, 'style'> {
  style?: Style
}

export const Table = forwardRef<Instance, TableProps>(function Table({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }} />
})

export const TableHeader = forwardRef<Instance, TableProps>(function TableHeader({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', ...style }} />
})

export const TableBody = forwardRef<Instance, TableProps>(function TableBody({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', ...style }} />
})

export const TableFooter = forwardRef<Instance, TableProps>(function TableFooter({ style, ...props }, ref) {
  const t = useTheme()
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', backgroundColor: t.colors.muted, ...style }} />
})

export interface TableRowProps extends TableProps {
  selected?: boolean
  /** Turn off the hover wash, for header rows. */
  interactive?: boolean
}

export const TableRow = forwardRef<Instance, TableRowProps>(function TableRow({ style, selected = false, interactive = true, ...props }, ref) {
  const t = useTheme()
  return (
    <div
      {...props}
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 40,
        borderBottomWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: selected ? t.colors.muted : undefined,
        hover: interactive ? { backgroundColor: selected ? t.colors.muted : t.colors.overlay } : undefined,
        ...style,
      }}
    />
  )
})

export interface TableCellProps extends Omit<DivProps, 'style' | 'children'> {
  style?: Style
  textStyle?: Style
  children?: ReactNode
  /** Fixed column width. Without it the cell shares the row equally. */
  width?: number
  align?: 'left' | 'center' | 'right'
}

const cellBox = (width: number | undefined, align: TableCellProps['align']): Style => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  minWidth: 0,
  ...(width === undefined ? { flexGrow: 1, flexBasis: 0 } : { width, flexShrink: 0 }),
})

export const TableHead = forwardRef<Instance, TableCellProps>(function TableHead({ style, textStyle, children, width, align, ...props }, ref) {
  const t = useTheme()
  return (
    <div {...props} ref={ref} style={{ ...cellBox(width, align), height: 40, ...style }}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, fontWeight: 500, color: t.colors.mutedForeground, whiteSpace: 'nowrap', textOverflow: 'ellipsis', ...textStyle })}
    </div>
  )
})

export const TableCell = forwardRef<Instance, TableCellProps>(function TableCell({ style, textStyle, children, width, align, ...props }, ref) {
  const t = useTheme()
  return (
    <div {...props} ref={ref} style={{ ...cellBox(width, align), ...style }}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, color: t.colors.foreground, minWidth: 0, ...textStyle })}
    </div>
  )
})

export const TableCaption = forwardRef<Instance, { children?: ReactNode; style?: Style }>(function TableCaption({ children, style }, ref) {
  const t = useTheme()
  return (
    <div ref={ref} style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, ...style }}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, color: t.colors.mutedForeground })}
    </div>
  )
})
