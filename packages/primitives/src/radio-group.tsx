/** Headless RadioGroup. Arrow keys move selection and focus between items. */
import React, { createContext, forwardRef, useContext, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { isActivationKey, useControllableState, useFocusElement, useItemRegistry, type DivProps, type Instance, type RegistryItem } from './internal'

interface RadioRecord extends RegistryItem {
  value: string
  instance: Instance | null
}

interface RadioGroupContextValue {
  value: string | undefined
  setValue: (value: string) => void
  disabled: boolean
  register: (item: Omit<RadioRecord, 'order'>) => () => void
  step: (currentId: string | null, delta: number) => RadioRecord | undefined
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export interface RadioGroupProps extends Omit<DivProps, 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
}

export const RadioGroup = forwardRef<Instance, RadioGroupProps>(function RadioGroup(
  { value: valueProp, defaultValue, onValueChange, disabled = false, orientation = 'vertical', children, style, ...props },
  ref,
) {
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  })
  const registry = useItemRegistry<RadioRecord>()
  const context = useMemo<RadioGroupContextValue>(
    () => ({ value, setValue: (next: string) => setValue(next), disabled, register: registry.register, step: registry.step }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, disabled],
  )
  return (
    <RadioGroupContext.Provider value={context}>
      <div {...props} ref={ref} style={{ display: 'flex', flexDirection: orientation === 'vertical' ? 'column' : 'row', ...style }}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
})

export interface RadioItemState {
  checked: boolean
  disabled: boolean
}

const RadioItemContext = createContext<RadioItemState>({ checked: false, disabled: false })

export interface RadioGroupItemProps extends Omit<DivProps, 'style' | 'children'> {
  value: string
  disabled?: boolean
  style?: StateStyle<RadioItemState>
  children?: ReactNode | ((state: RadioItemState) => ReactNode)
}

export const RadioGroupItem = forwardRef<Instance, RadioGroupItemProps>(function RadioGroupItem(
  { value, disabled: disabledProp = false, style, children, onClick, onKeyDown, ...props },
  forwardedRef,
) {
  const group = useContext(RadioGroupContext)
  if (!group) throw new Error('RadioGroupItem must be used inside RadioGroup')
  const focus = useFocusElement()
  const disabled = disabledProp || group.disabled
  const instanceRef = useRef<Instance | null>(null)
  useLayoutEffect(
    () => group.register({ id: value, value, disabled, instance: instanceRef.current }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, disabled],
  )
  const state: RadioItemState = { checked: group.value === value, disabled }
  const move = (target: RadioRecord | undefined) => {
    if (!target) return
    focus(target.instance)
    group.setValue(target.value)
  }
  return (
    <RadioItemContext.Provider value={state}>
      <div
        {...props}
        ref={(instance) => {
          instanceRef.current = instance
          if (typeof forwardedRef === 'function') forwardedRef(instance)
          else if (forwardedRef) forwardedRef.current = instance
        }}
        tabIndex={disabled ? -1 : (props.tabIndex ?? 0)}
        style={resolveStyle(style, state)}
        onClick={(event) => {
          onClick?.(event)
          if (!disabled) group.setValue(value)
        }}
        onKeyDown={(event: EventPayload) => {
          onKeyDown?.(event)
          if (disabled) return
          if (event.key === 'down' || event.key === 'right') move(group.step(value, 1))
          else if (event.key === 'up' || event.key === 'left') move(group.step(value, -1))
          else if (isActivationKey(event)) group.setValue(value)
        }}
      >
        {typeof children === 'function' ? children(state) : children}
      </div>
    </RadioItemContext.Provider>
  )
})

export const RadioGroupIndicator = forwardRef<Instance, DivProps & { forceMount?: boolean }>(function RadioGroupIndicator({ forceMount, children, ...props }, ref) {
  const state = useContext(RadioItemContext)
  if (!state.checked && !forceMount) return null
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  )
})

export { RadioGroup as Root, RadioGroupItem as Item, RadioGroupIndicator as Indicator }
