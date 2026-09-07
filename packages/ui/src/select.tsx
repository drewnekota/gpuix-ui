/**
 * Styled Select over `@gpuix/react/select`.
 *
 * The primitive discovers its items by walking the React element tree for
 * `SelectPrimitive.Item` by identity, so a styled wrapper component would be
 * invisible to it (no keyboard navigation, no value label). The styled root
 * therefore rewrites `<SelectItem>` elements into primitive items before
 * handing children to the primitive, and keeps a value→label map for
 * `<SelectValue>`.
 */
import React, { Children, cloneElement, createContext, forwardRef, isValidElement, useContext, useMemo, type ReactElement, type ReactNode } from 'react'
import * as SelectPrimitive from '@gpuix/react/select'
import { useTheme, type Style, type Theme } from '@gpuix-ui/core'
import { useControllableState, type Instance } from '@gpuix-ui/primitives'
import { Icon } from './icons'
import { asText } from './internal'

export const SelectGroup: typeof SelectPrimitive.Group = SelectPrimitive.Group

interface SelectContextValue {
  value: string | undefined
  labels: Map<string, ReactNode>
}
const SelectContext = createContext<SelectContextValue>({ value: undefined, labels: new Map() })

export interface SelectItemProps extends Omit<SelectPrimitive.SelectItemProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
  /** Secondary text under the label. */
  description?: ReactNode
}

function itemStyle(t: Theme, style?: Style) {
  return (state: SelectPrimitive.SelectItemState): Style => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: t.radius.sm,
    cursor: state.disabled ? 'default' : 'pointer',
    opacity: state.disabled ? 0.5 : 1,
    backgroundColor: state.highlighted ? t.colors.accent : t.colors.popover,
    ...style,
  })
}

function itemChildren(t: Theme, children: ReactNode, description: ReactNode) {
  return (state: SelectPrimitive.SelectItemState) => (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.sm + 2, color: t.colors.popoverForeground })}
        {asText(description, { fontFamily: t.font.sans, fontSize: t.font.size.xs, lineHeight: t.font.lineHeight.xs, color: t.colors.mutedForeground })}
      </div>
      <div style={{ width: 14, height: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {state.selected ? <Icon name="check" size={14} color={t.colors.foreground} /> : null}
      </div>
    </>
  )
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/** Styled item. Inside `<Select>` it is rewritten into the primitive; alone it renders the primitive directly. */
export const SelectItem = forwardRef<Instance, SelectItemProps>(function SelectItem({ style, children, description, textValue, ...props }, ref) {
  const t = useTheme()
  return (
    <SelectPrimitive.Item {...props} ref={ref} textValue={textValue ?? textOf(children)} style={itemStyle(t, style)}>
      {itemChildren(t, children, description)}
    </SelectPrimitive.Item>
  )
})

function rewrite(node: ReactNode, t: Theme, labels: Map<string, ReactNode>): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child
    if (child.type === SelectItem) {
      const { style, children, description, textValue, ...rest } = child.props as SelectItemProps
      labels.set(rest.value, children)
      return (
        <SelectPrimitive.Item key={child.key ?? rest.value} {...rest} textValue={textValue ?? textOf(children)} style={itemStyle(t, style)}>
          {itemChildren(t, children, description)}
        </SelectPrimitive.Item>
      )
    }
    const props = child.props as { children?: ReactNode }
    if (props.children === undefined || typeof props.children === 'function') return child
    return cloneElement(child as ReactElement<{ children?: ReactNode }>, { children: rewrite(props.children, t, labels) })
  })
}

export interface SelectProps extends SelectPrimitive.SelectProps {}

export function Select({ children, value: valueProp, defaultValue, onValueChange, ...props }: SelectProps) {
  const t = useTheme()
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  })
  const labels = new Map<string, ReactNode>()
  const rewritten = rewrite(children, t, labels)
  const labelKey = [...labels.keys()].join(' ')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const context = useMemo(() => ({ value, labels }), [value, labelKey])
  return (
    <SelectContext.Provider value={context}>
      <SelectPrimitive.Root {...props} value={value} onValueChange={setValue}>
        {rewritten}
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends Omit<SelectPrimitive.SelectTriggerProps, 'style' | 'children'> {
  style?: Style
  children?: ReactNode
  size?: 'sm' | 'md'
  /** Render as a borderless chip, for toolbars and composers. */
  variant?: 'outline' | 'ghost'
}

export const SelectTrigger = forwardRef<Instance, SelectTriggerProps>(function SelectTrigger(
  { style, children, size = 'md', variant = 'outline', ...props },
  ref,
) {
  const t = useTheme()
  return (
    <SelectPrimitive.Trigger
      {...props}
      ref={ref}
      style={(state) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: size === 'sm' ? 28 : 36,
        paddingLeft: variant === 'ghost' ? 8 : 12,
        paddingRight: variant === 'ghost' ? 6 : 10,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: variant === 'ghost' ? '#00000000' : state.open ? t.colors.ring : t.colors.input,
        backgroundColor: variant === 'ghost' ? (state.open ? t.colors.accent : '#00000000') : t.colors.background,
        cursor: 'pointer',
        userSelect: 'none',
        opacity: state.disabled ? 0.5 : 1,
        hover: { backgroundColor: t.colors.accent },
        ...style,
      })}
    >
      {asText(children, { fontFamily: t.font.sans, fontSize: size === 'sm' ? t.font.size.sm : t.font.size.base, color: t.colors.foreground, whiteSpace: 'nowrap' })}
      <Icon name="chevronDown" size={14} color={t.colors.mutedForeground} />
    </SelectPrimitive.Trigger>
  )
})

export interface SelectValueProps extends Omit<SelectPrimitive.SelectValueProps, 'style' | 'placeholder'> {
  style?: Style
  size?: 'sm' | 'md'
  placeholder?: ReactNode
}

/** The selected item's label, or the placeholder, as themed text. */
export const SelectValue = forwardRef<Instance, SelectValueProps>(function SelectValue({ placeholder, style, size = 'md', children, ...props }, ref) {
  const t = useTheme()
  const { value, labels } = useContext(SelectContext)
  const fontSize = size === 'sm' ? t.font.size.sm : t.font.size.base
  const label = value !== undefined ? labels.get(value) : undefined
  const content =
    children ??
    (label !== undefined
      ? asText(label, { fontFamily: t.font.sans, fontSize, color: t.colors.foreground, whiteSpace: 'nowrap' })
      : asText(placeholder, { fontFamily: t.font.sans, fontSize, color: t.colors.mutedForeground, whiteSpace: 'nowrap' }))
  return (
    <SelectPrimitive.Value {...props} ref={ref} style={{ display: 'flex', minWidth: 0, ...style }}>
      {content}
    </SelectPrimitive.Value>
  )
})

export interface SelectContentProps extends Omit<SelectPrimitive.SelectContentProps, 'style'> {
  style?: Style
}

export const SelectContent = forwardRef<Instance, SelectContentProps>(function SelectContent({ style, sideOffset = 4, ...props }, ref) {
  const t = useTheme()
  return (
    <SelectPrimitive.Content
      {...props}
      ref={ref}
      sideOffset={sideOffset}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 160,
        padding: 4,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.popover,
        boxShadow: t.shadow.md,
        userSelect: 'none',
        ...style,
      }}
    />
  )
})

export const SelectLabel = forwardRef<Instance, { children?: ReactNode; style?: Style }>(function SelectLabel({ children, style }, ref) {
  const t = useTheme()
  return (
    <SelectPrimitive.Label ref={ref} style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 4, ...style }}>
      {asText(children, { fontFamily: t.font.sans, fontSize: t.font.size.xs, fontWeight: 500, color: t.colors.mutedForeground })}
    </SelectPrimitive.Label>
  )
})

export const SelectSeparator = forwardRef<Instance, { style?: Style }>(function SelectSeparator({ style }, ref) {
  const t = useTheme()
  return <SelectPrimitive.Separator ref={ref} style={{ height: 1, marginTop: 4, marginBottom: 4, marginLeft: -4, marginRight: -4, backgroundColor: t.colors.border, ...style }} />
})
