/**
 * Headless Command: a filterable list driven from a native text input, the
 * shape of cmdk. Items register on mount; the root scores them against the
 * search and keeps a highlighted item the keyboard moves through.
 */
import React, { createContext, forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import type { JSX } from '@gpuix/react/jsx-runtime'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { isActivationKey, useControllableState, useStableId, type DivProps, type Instance } from './internal'

type HostInputProps = JSX.IntrinsicElements['input']

interface CommandItemRecord {
  id: string
  value: string
  keywords: string[]
  disabled: boolean
  group: string | null
  order: number
  select: () => void
}

interface CommandContextValue {
  search: string
  setSearch: (search: string) => void
  register: (item: Omit<CommandItemRecord, 'order'>) => () => void
  isVisible: (id: string) => boolean
  groupHasVisible: (group: string) => boolean
  visibleCount: number
  highlightedId: string | null
  setHighlightedId: (id: string | null) => void
  move: (delta: number) => void
  moveTo: (edge: 'first' | 'last') => void
  selectHighlighted: () => void
  listRef: React.MutableRefObject<Instance | null>
}

const CommandContext = createContext<CommandContextValue | null>(null)

function useCommandContext(name: string): CommandContextValue {
  const context = useContext(CommandContext)
  if (!context) throw new Error(`${name} must be used inside Command`)
  return context
}

/** Default filter: 1 for a substring hit, a smaller score for an in-order subsequence, 0 for no match. */
export function commandScore(value: string, search: string, keywords: string[] = []): number {
  const needle = search.trim().toLowerCase()
  if (!needle) return 1
  const haystacks = [value, ...keywords].map((text) => text.toLowerCase())
  let best = 0
  for (const hay of haystacks) {
    if (hay.includes(needle)) {
      best = Math.max(best, hay.startsWith(needle) ? 1 : 0.9)
      continue
    }
    let index = 0
    for (const char of needle) {
      index = hay.indexOf(char, index)
      if (index < 0) {
        index = -1
        break
      }
      index += 1
    }
    if (index >= 0) best = Math.max(best, 0.5)
  }
  return best
}

export interface CommandProps extends Omit<DivProps, 'onChange'> {
  /** Controlled search text. */
  search?: string
  defaultSearch?: string
  onSearchChange?: (search: string) => void
  /** Return 0 to hide an item. Default: `commandScore`. */
  filter?: (value: string, search: string, keywords: string[]) => number
  /** Turn filtering off and render every item, for server-side search. */
  shouldFilter?: boolean
  loop?: boolean
}

export const Command = forwardRef<Instance, CommandProps>(function Command(
  { search: searchProp, defaultSearch = '', onSearchChange, filter = commandScore, shouldFilter = true, loop = true, children, style, ...props },
  ref,
) {
  const [search, setSearch] = useControllableState({ value: searchProp, defaultValue: defaultSearch, onChange: onSearchChange })
  const [items, setItems] = useState<Map<string, CommandItemRecord>>(() => new Map())
  const order = useRef(0)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listRef = useRef<Instance | null>(null)

  const register = useCallback((item: Omit<CommandItemRecord, 'order'>) => {
    setItems((current) => {
      const next = new Map(current)
      next.set(item.id, { ...item, order: current.get(item.id)?.order ?? order.current++ })
      return next
    })
    return () => {
      setItems((current) => {
        const next = new Map(current)
        next.delete(item.id)
        return next
      })
    }
  }, [])

  const visible = useMemo(() => {
    const list = [...items.values()].sort((a, b) => a.order - b.order)
    if (!shouldFilter) return list
    return list
      .map((item) => ({ item, score: filter(item.value, search, item.keywords) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.order - b.item.order)
      .map((entry) => entry.item)
  }, [items, search, filter, shouldFilter])

  const visibleIds = useMemo(() => new Set(visible.map((item) => item.id)), [visible])
  const enabled = useMemo(() => visible.filter((item) => !item.disabled), [visible])

  // Keep the highlight on a visible item; default to the first match.
  useEffect(() => {
    if (highlightedId && enabled.some((item) => item.id === highlightedId)) return
    setHighlightedId(enabled[0]?.id ?? null)
  }, [enabled, highlightedId])

  const move = (delta: number) => {
    if (enabled.length === 0) return
    const index = enabled.findIndex((item) => item.id === highlightedId)
    let next = index < 0 ? (delta > 0 ? 0 : enabled.length - 1) : index + delta
    if (loop) next = (next + enabled.length) % enabled.length
    else next = Math.max(0, Math.min(enabled.length - 1, next))
    setHighlightedId(enabled[next]!.id)
  }

  const context: CommandContextValue = {
    search,
    setSearch,
    register,
    isVisible: (id) => visibleIds.has(id),
    groupHasVisible: (group) => visible.some((item) => item.group === group),
    visibleCount: visible.length,
    highlightedId,
    setHighlightedId,
    move,
    moveTo: (edge) => setHighlightedId((edge === 'first' ? enabled[0] : enabled.at(-1))?.id ?? null),
    selectHighlighted: () => {
      const item = highlightedId ? items.get(highlightedId) : undefined
      if (item && !item.disabled) item.select()
    },
    listRef,
  }

  return (
    <CommandContext.Provider value={context}>
      <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', ...style }}>
        {children}
      </div>
    </CommandContext.Provider>
  )
})

export interface CommandInputProps extends Omit<HostInputProps, 'value' | 'onChange'> {
  onChange?: (event: EventPayload) => void
  onSubmit?: (event: EventPayload) => void
  onEscapeKeyDown?: (event: EventPayload) => void
}

/** The native input. Owns focus, so arrow keys arrive here; Enter arrives as `onSubmit`. */
export const CommandInput = forwardRef<Instance, CommandInputProps>(function CommandInput({ onChange, onKeyDown, onSubmit, onEscapeKeyDown, autoFocus = true, ...props }, ref) {
  const command = useCommandContext('CommandInput')
  return (
    <input
      {...props}
      ref={ref}
      autoFocus={autoFocus}
      value={command.search}
      onChange={(event) => {
        onChange?.(event)
        command.setSearch(event.value ?? '')
      }}
      onSubmit={(event) => {
        onSubmit?.(event)
        command.selectHighlighted()
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        const ctrl = event.modifiers?.ctrl
        if (event.key === 'down' || (event.key === 'n' && ctrl)) command.move(1)
        else if (event.key === 'up' || (event.key === 'p' && ctrl)) command.move(-1)
        else if (event.key === 'home' && ctrl) command.moveTo('first')
        else if (event.key === 'end' && ctrl) command.moveTo('last')
        else if (event.key === 'enter') command.selectHighlighted()
        else if (event.key === 'escape') onEscapeKeyDown?.(event)
      }}
    />
  )
})

export const CommandList = forwardRef<Instance, DivProps>(function CommandList({ children, style, ...props }, forwardedRef) {
  const command = useCommandContext('CommandList')
  return (
    <div
      {...props}
      ref={(instance) => {
        command.listRef.current = instance
        if (typeof forwardedRef === 'function') forwardedRef(instance)
        else if (forwardedRef) forwardedRef.current = instance
      }}
      style={{ display: 'flex', flexDirection: 'column', ...style }}
    >
      {children}
    </div>
  )
})

/** Renders its children only when the search matched nothing. */
export const CommandEmpty = forwardRef<Instance, DivProps>(function CommandEmpty({ children, ...props }, ref) {
  const command = useCommandContext('CommandEmpty')
  if (command.visibleCount > 0) return null
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  )
})

const GroupContext = createContext<string | null>(null)

export interface CommandGroupProps extends DivProps {
  /** Group heading, rendered by the styled layer; the primitive only needs an identity. */
  heading?: ReactNode
  forceMount?: boolean
}

/** Hidden when none of its items match. */
export const CommandGroup = forwardRef<Instance, CommandGroupProps>(function CommandGroup({ heading: _heading, forceMount, children, style, ...props }, ref) {
  const command = useCommandContext('CommandGroup')
  const id = useStableId('command-group')
  const visible = forceMount || command.groupHasVisible(id) || command.visibleCount === 0
  return (
    <GroupContext.Provider value={id}>
      <div {...props} ref={ref} style={{ display: visible ? (style?.display ?? 'flex') : 'none', flexDirection: 'column', ...style }}>
        {children}
      </div>
    </GroupContext.Provider>
  )
})

export function useCommandGroupVisible(): boolean {
  const command = useCommandContext('useCommandGroupVisible')
  const id = useContext(GroupContext)
  return id ? command.groupHasVisible(id) : true
}

export interface CommandItemState {
  highlighted: boolean
  disabled: boolean
}

export interface CommandItemProps extends Omit<DivProps, 'style' | 'children'> {
  /** What the filter matches. Defaults to the text of string children. */
  value?: string
  keywords?: string[]
  disabled?: boolean
  onSelect?: (value: string) => void
  forceMount?: boolean
  style?: StateStyle<CommandItemState>
  children?: ReactNode | ((state: CommandItemState) => ReactNode)
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (React.isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

export const CommandItem = forwardRef<Instance, CommandItemProps>(function CommandItem(
  { value: valueProp, keywords = [], disabled = false, onSelect, forceMount, style, children, onClick, onMouseEnter, onKeyDown, ...props },
  ref,
) {
  const command = useCommandContext('CommandItem')
  const group = useContext(GroupContext)
  const id = useStableId('command-item')
  const value = valueProp ?? (typeof children === 'function' ? id : textOf(children))
  const selectRef = useRef(() => onSelect?.(value))
  selectRef.current = () => onSelect?.(value)
  const keywordsKey = keywords.join(' ')
  useLayoutEffect(
    () => command.register({ id, value, keywords, disabled, group, select: () => selectRef.current() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, value, keywordsKey, disabled, group],
  )
  if (!forceMount && !command.isVisible(id)) return null
  const state: CommandItemState = { highlighted: command.highlightedId === id, disabled }
  return (
    <div
      {...props}
      ref={ref}
      style={resolveStyle(style, state)}
      onMouseEnter={(event) => {
        onMouseEnter?.(event)
        if (!disabled) command.setHighlightedId(id)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (!disabled) onSelect?.(value)
      }}
      onKeyDown={(event: EventPayload) => {
        onKeyDown?.(event)
        if (!disabled && isActivationKey(event)) onSelect?.(value)
      }}
    >
      {typeof children === 'function' ? children(state) : children}
    </div>
  )
})

export const CommandSeparator = forwardRef<Instance, DivProps>(function CommandSeparator(props, ref) {
  return <div {...props} ref={ref} />
})

export function useCommandState(): { search: string; visibleCount: number; highlightedId: string | null } {
  const { search, visibleCount, highlightedId } = useCommandContext('useCommandState')
  return { search, visibleCount, highlightedId }
}

export { Command as Root, CommandInput as Input, CommandList as List, CommandEmpty as Empty, CommandGroup as Group, CommandItem as Item, CommandSeparator as Separator }
