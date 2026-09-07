import React, { forwardRef } from 'react'
import type { Instance } from '@gpuix-ui/primitives'
import { Text, type TextProps } from './text'

export const Label = forwardRef<Instance, TextProps>(function Label(props, ref) {
  return <Text size="sm" weight="medium" {...props} ref={ref} />
})
