/** Headless Checkbox. Space or Enter toggles; `indeterminate` is a third checked state. */
import React, { createContext, forwardRef, useContext, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { isActivationKey, useControllableState, type DivProps, type Instance } from './internal'

export type CheckedState = boolean | 'indeterminate'

export interface CheckboxState {
  checked: CheckedState
  disabled: boolean
}

const CheckboxContext = createContext<CheckboxState>({ checked: false, disabled: false })

export interface CheckboxProps extends Omit<DivProps, 'style' | 'children' | 'onChange'> {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  style?: StateStyle<CheckboxState>
  children?: ReactNode | ((state: CheckboxState) => ReactNode)
}

export const Checkbox = forwardRef<Instance, CheckboxProps>(function Checkbox(
  { checked: checkedProp, defaultChecked = false, onCheckedChange, disabled = false, style, children, onClick, onKeyDown, ...props },
  ref,
) {
  const [checked, setChecked] = useControllableState<CheckedState>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: (next) => onCheckedChange?.(next === true),
  })
  const toggle = () => {
    if (disabled) return
    setChecked(checked === true ? false : true)
  }
  const state: CheckboxState = { checked, disabled }
  return (
    <CheckboxContext.Provider value={state}>
      <div
        {...props}
        ref={ref}
        tabIndex={disabled ? -1 : (props.tabIndex ?? 0)}
        style={resolveStyle(style, state)}
        onClick={(event) => {
          onClick?.(event)
          toggle()
        }}
        onKeyDown={(event: EventPayload) => {
          onKeyDown?.(event)
          if (isActivationKey(event)) toggle()
        }}
      >
        {typeof children === 'function' ? children(state) : children}
      </div>
    </CheckboxContext.Provider>
  )
})

/** Renders children while checked or indeterminate. */
export const CheckboxIndicator = forwardRef<Instance, DivProps & { forceMount?: boolean }>(function CheckboxIndicator({ forceMount, children, ...props }, ref) {
  const state = useContext(CheckboxContext)
  if (state.checked === false && !forceMount) return null
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  )
})

export function useCheckboxState(): CheckboxState {
  return useContext(CheckboxContext)
}

export { Checkbox as Root, CheckboxIndicator as Indicator }
