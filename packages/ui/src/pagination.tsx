import React, { forwardRef, type ReactNode } from 'react'
import { useTheme, type Style } from '@gpuix-ui/core'
import type { DivProps, Instance } from '@gpuix-ui/primitives'
import { Button, type ButtonProps } from './button'
import { Icon } from './icons'

export interface PaginationProps extends Omit<DivProps, 'style'> {
  style?: Style
}

export const Pagination = forwardRef<Instance, PaginationProps>(function Pagination({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', ...style }} />
})

export const PaginationContent = forwardRef<Instance, PaginationProps>(function PaginationContent({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, ...style }} />
})

export const PaginationItem = forwardRef<Instance, PaginationProps>(function PaginationItem({ style, ...props }, ref) {
  return <div {...props} ref={ref} style={{ display: 'flex', ...style }} />
})

export interface PaginationLinkProps extends Omit<ButtonProps, 'variant' | 'size'> {
  isActive?: boolean
  size?: ButtonProps['size']
}

export const PaginationLink = forwardRef<Instance, PaginationLinkProps>(function PaginationLink({ isActive = false, size = 'iconSm', ...props }, ref) {
  return <Button {...props} ref={ref} variant={isActive ? 'outline' : 'ghost'} size={size} />
})

export const PaginationPrevious = forwardRef<Instance, Omit<ButtonProps, 'variant' | 'size'>>(function PaginationPrevious({ children, ...props }, ref) {
  const t = useTheme()
  return (
    <Button {...props} ref={ref} variant="ghost" size="sm">
      <Icon name="chevronLeft" size={14} color={t.colors.foreground} />
      {children ?? 'Previous'}
    </Button>
  )
})

export const PaginationNext = forwardRef<Instance, Omit<ButtonProps, 'variant' | 'size'>>(function PaginationNext({ children, ...props }, ref) {
  const t = useTheme()
  return (
    <Button {...props} ref={ref} variant="ghost" size="sm">
      {children ?? 'Next'}
      <Icon name="chevronRight" size={14} color={t.colors.foreground} />
    </Button>
  )
})

export function PaginationEllipsis({ style }: { style?: Style }) {
  const t = useTheme()
  return (
    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <Icon name="ellipsis" size={16} color={t.colors.mutedForeground} />
    </div>
  )
}

export type PaginationRangeEntry = number | 'ellipsis'

/** The page numbers to show around `page`, with ellipses where pages are skipped. */
export function paginationRange(page: number, count: number, siblings = 1): PaginationRangeEntry[] {
  if (count <= 0) return []
  const total = siblings * 2 + 5
  if (count <= total) return Array.from({ length: count }, (_, index) => index + 1)
  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, count)
  const showLeftDots = left > 2
  const showRightDots = right < count - 1
  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + 2 * siblings
    return [...Array.from({ length: leftCount }, (_, index) => index + 1), 'ellipsis', count]
  }
  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + 2 * siblings
    return [1, 'ellipsis', ...Array.from({ length: rightCount }, (_, index) => count - rightCount + index + 1)]
  }
  return [1, 'ellipsis', ...Array.from({ length: right - left + 1 }, (_, index) => left + index), 'ellipsis', count]
}

export interface SimplePaginationProps {
  page: number
  count: number
  onPageChange: (page: number) => void
  siblings?: number
  style?: Style
  children?: ReactNode
}

/** The common case wired up: previous, numbered pages with ellipses, next. */
export function SimplePagination({ page, count, onPageChange, siblings = 1, style }: SimplePaginationProps) {
  return (
    <Pagination style={style}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious testId="pagination-previous" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        </PaginationItem>
        {paginationRange(page, count, siblings).map((entry, index) =>
          entry === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink testId={`pagination-${entry}`} isActive={entry === page} onClick={() => onPageChange(entry)}>
                {String(entry)}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext testId="pagination-next" disabled={page >= count} onClick={() => onPageChange(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
