/**
 * Toasts, sonner-shaped: an imperative `toast()` anywhere, one `<Toaster>` in
 * the tree. The store is module-level so agent code outside React can call it.
 * The stack renders into a window-absolute `<anchored>` layer.
 */
import React, { useEffect, useState, type ReactNode } from 'react'
import { useWindowSize } from '@gpuix/react'
import { useTheme, withAlpha, type Style } from '@gpuix-ui/core'
import { Button } from './button'
import { Icon, type IconName } from './icons'
import { asText } from './internal'

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning'

export interface ToastOptions {
  id?: string
  title?: ReactNode
  description?: ReactNode
  variant?: ToastVariant
  /** Milliseconds before auto-dismiss. 0 keeps it until closed. Default 4000. */
  duration?: number
  action?: { label: string; onClick: () => void }
  icon?: IconName | null
}

export interface ToastData extends ToastOptions {
  id: string
  createdAt: number
}

type Listener = (toasts: ToastData[]) => void

let toasts: ToastData[] = []
const listeners = new Set<Listener>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()
let counter = 0

function emit() {
  for (const listener of listeners) listener(toasts)
}

function schedule(item: ToastData) {
  const existing = timers.get(item.id)
  if (existing) clearTimeout(existing)
  const duration = item.duration ?? 4000
  if (duration > 0) timers.set(item.id, setTimeout(() => dismiss(item.id), duration))
}

export function dismiss(id?: string) {
  if (id === undefined) {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
    toasts = []
  } else {
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
    toasts = toasts.filter((item) => item.id !== id)
  }
  emit()
}

function push(input: string | ToastOptions, variant?: ToastVariant): string {
  const options: ToastOptions = typeof input === 'string' ? { title: input } : input
  const id = options.id ?? `toast-${++counter}`
  const item: ToastData = { ...options, variant: options.variant ?? variant ?? 'default', id, createdAt: Date.now() }
  toasts = [...toasts.filter((existing) => existing.id !== id), item]
  schedule(item)
  emit()
  return id
}

/** Show a toast. Returns its id, for `toast.dismiss(id)` or updating with the same id. */
export const toast = Object.assign((input: string | ToastOptions) => push(input), {
  success: (input: string | ToastOptions) => push(input, 'success'),
  error: (input: string | ToastOptions) => push(input, 'destructive'),
  warning: (input: string | ToastOptions) => push(input, 'warning'),
  dismiss,
})

export function useToasts(): ToastData[] {
  const [state, setState] = useState(toasts)
  useEffect(() => {
    listeners.add(setState)
    setState(toasts)
    return () => {
      listeners.delete(setState)
    }
  }, [])
  return state
}

export type ToasterPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'

export interface ToasterProps {
  position?: ToasterPosition
  /** Distance from the window edges. */
  offset?: number
  width?: number
  /** Most recent first. Default true for bottom positions. */
  newestOnTop?: boolean
  style?: Style
}

export function Toaster({ position = 'bottom-right', offset = 16, width = 360, newestOnTop, style }: ToasterProps) {
  const items = useToasts()
  const { width: windowWidth, height: windowHeight } = useWindowSize()
  if (items.length === 0) return null
  const top = position.startsWith('top')
  const x = position.endsWith('left') ? offset : position.endsWith('right') ? windowWidth - offset - width : (windowWidth - width) / 2
  const y = top ? offset : windowHeight - offset
  const ordered = (newestOnTop ?? !top) ? [...items].reverse() : items
  // A zero-sized anchor owns placement only; absolute children paint the stack.
  // GPUIX otherwise supplies an opaque default fill behind gaps and rounded corners.
  return (
    <anchored position={{ x, y }} anchor="topLeft" deferred priority={5} occlude={false} snapMargin={0} style={{ width: 0, height: 0 }}>
      <div testId="toast-stack" style={{ position: 'absolute', left: 0, ...(top ? { top: 0 } : { bottom: 0 }), display: 'flex', flexDirection: 'column', gap: 8, width, ...style }}>
        {ordered.map((item) => (
          <ToastCard key={item.id} toast={item} />
        ))}
      </div>
    </anchored>
  )
}

function ToastCard({ toast: item }: { toast: ToastData }) {
  const t = useTheme()
  const variant = item.variant ?? 'default'
  const accent = variant === 'success' ? t.colors.success : variant === 'destructive' ? t.colors.destructive : variant === 'warning' ? t.colors.warning : t.colors.foreground
  const icon: IconName | null = item.icon === null ? null : (item.icon ?? (variant === 'success' ? 'check' : variant === 'destructive' || variant === 'warning' ? 'alertTriangle' : 'info'))
  return (
    <div
      testId={`toast-${item.id}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 14,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: variant === 'default' ? t.colors.border : withAlpha(accent, 0.4),
        backgroundColor: t.colors.popover,
        boxShadow: t.shadow.md,
        pointerEvents: 'auto',
      }}
    >
      {icon ? <Icon name={icon} size={16} color={accent} style={{ marginTop: 2 }} /> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, minWidth: 0 }}>
        {asText(item.title, { fontFamily: t.font.sans, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.sm, fontWeight: 500, color: t.colors.popoverForeground })}
        {asText(item.description, { fontFamily: t.font.sans, fontSize: t.font.size.sm, lineHeight: t.font.lineHeight.sm, color: t.colors.mutedForeground })}
      </div>
      {item.action ? (
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            item.action?.onClick()
            dismiss(item.id)
          }}
        >
          {item.action.label}
        </Button>
      ) : null}
      <div
        testId={`toast-close-${item.id}`}
        onClick={() => dismiss(item.id)}
        style={{ width: 20, height: 20, borderRadius: t.radius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.6, hover: { backgroundColor: t.colors.accent, opacity: 1 } }}
      >
        <Icon name="x" size={12} color={t.colors.foreground} />
      </div>
    </div>
  )
}
