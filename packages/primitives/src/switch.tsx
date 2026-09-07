/** Headless Switch. Same contract as Checkbox with a boolean value and a Thumb slot. */
import React, { createContext, forwardRef, useContext, type ReactNode } from 'react'
import type { EventPayload } from '@gpuix/react'
import { resolveStyle, type StateStyle } from '@gpuix-ui/core'
import { isActivationKey, useControllableState, type DivProps, type Instance } from './internal'

export interface SwitchState {
  checked: boolean
  disabled: boolean
}

const SwitchContext = createContext<SwitchState>({ checked: false, disabled: false })

export interface SwitchProps extends Omit<DivProps, 'style' | 'children' | 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  style?: StateStyle<SwitchState>
  children?: ReactNode | ((state: SwitchState) => ReactNode)
}

export const Switch = forwardRef<Instance, SwitchProps>(function Switch(
  { checked: checkedProp, defaultChecked = false, onCheckedChange, disabled = false, style, children, onClick, onKeyDown, ...props },
  ref,
) {
  const [checked, setChecked] = useControllableState({ value: checkedProp, defaultValue: defaultChecked, onChange: onCheckedChange })
  const toggle = () => {
    if (!disabled) setChecked(!checked)
  }
  const state: SwitchState = { checked, disabled }
  return (
    <SwitchContext.Provider value={state}>
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
    </SwitchContext.Provider>
  )
})

export interface SwitchThumbProps extends Omit<DivProps, 'style'> {
  style?: StateStyle<SwitchState>
}

export const SwitchThumb = forwardRef<Instance, SwitchThumbProps>(function SwitchThumb({ style, ...props }, ref) {
  const state = useContext(SwitchContext)
  return <div {...props} ref={ref} style={resolveStyle(style, state)} />
})

export function useSwitchState(): SwitchState {
  return useContext(SwitchContext)
}

export { Switch as Root, SwitchThumb as Thumb }
