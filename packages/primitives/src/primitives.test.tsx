import React, { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { connectTest } from '@gpuix/react/automation'
import { createTestRoot, hasNativeTestRenderer } from '@gpuix/react/testing'
import * as Dialog from './dialog'
import * as Popover from './popover'
import * as Menu from './dropdown-menu'
import * as Tabs from './tabs'
import * as Checkbox from './checkbox'
import * as Switch from './switch'
import * as Radio from './radio-group'
import * as Collapsible from './collapsible'

const describeNative = hasNativeTestRenderer ? describe : describe.skip
const label = (text: string) => <text style={{ color: '#fff' }}>{text}</text>

describeNative('Dialog', () => {
  it('opens from the trigger, closes on Escape and on an outside press', async () => {
    const { render, renderer } = createTestRoot({ width: 800, height: 600 })
    render(
      <div style={{ width: '100%', height: '100%', backgroundColor: '#111' }}>
        <Dialog.Root>
          <Dialog.Trigger testId="open" style={{ width: 80, height: 30 }}>
            {label('Open')}
          </Dialog.Trigger>
          <Dialog.Overlay />
          <Dialog.Content testId="panel" style={{ width: 300, height: 200, backgroundColor: '#333' }}>
            <Dialog.Title style={{ color: '#fff' }}>Title</Dialog.Title>
            <Dialog.Close testId="close" style={{ width: 60, height: 24 }}>
              {label('Close')}
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </div>,
    )
    const app = await connectTest(renderer)
    expect(renderer.findByTestId('panel')).toBeUndefined()
    await app.getByTestId('open').click()
    expect(renderer.findByTestId('panel')).toBeDefined()
    const bounds = renderer.getElementBounds(renderer.findByTestId('panel')!.id)!
    expect(bounds[0]).toBe(250)
    expect(bounds[1]).toBe(200)
    renderer.simulateKeystrokes('escape')
    renderer.flush()
    expect(renderer.findByTestId('panel')).toBeUndefined()

    await app.getByTestId('open').click()
    expect(renderer.findByTestId('panel')).toBeDefined()
    renderer.nativeSimulateMouseDown(20, 500)
    renderer.nativeSimulateMouseUp(20, 500)
    renderer.flush()
    expect(renderer.findByTestId('panel')).toBeUndefined()

    await app.getByTestId('open').click()
    await app.getByTestId('close').click()
    expect(renderer.findByTestId('panel')).toBeUndefined()
    await app.close()
  })

  it('stays open on an outside press when dismissOnOutsidePress is false', async () => {
    const { render, renderer } = createTestRoot({ width: 800, height: 600 })
    render(
      <div style={{ width: '100%', height: '100%' }}>
        <Dialog.Root defaultOpen>
          <Dialog.Overlay />
          <Dialog.Content testId="panel" dismissOnOutsidePress={false} style={{ width: 300, height: 200, backgroundColor: '#333' }} />
        </Dialog.Root>
      </div>,
    )
    renderer.flush()
    renderer.nativeSimulateMouseDown(20, 500)
    renderer.nativeSimulateMouseUp(20, 500)
    renderer.flush()
    expect(renderer.findByTestId('panel')).toBeDefined()
  })
})

describeNative('Popover', () => {
  it('toggles from the trigger and dismisses on Escape', async () => {
    const { render, renderer } = createTestRoot({ width: 800, height: 600 })
    render(
      <div style={{ width: '100%', height: '100%', padding: 40 }}>
        <Popover.Root>
          <Popover.Trigger testId="trigger" style={{ width: 100, height: 30, backgroundColor: '#444' }}>
            {label('Trigger')}
          </Popover.Trigger>
          <Popover.Content testId="content" style={{ width: 200, height: 100, backgroundColor: '#222' }}>
            {label('Content')}
          </Popover.Content>
        </Popover.Root>
      </div>,
    )
    const app = await connectTest(renderer)
    await app.getByTestId('trigger').click()
    expect(renderer.findByTestId('content')).toBeDefined()
    const trigger = renderer.getElementBounds(renderer.findByTestId('trigger')!.id)!
    const content = renderer.getElementBounds(renderer.findByTestId('content')!.id)!
    expect(content[1]).toBeGreaterThanOrEqual(trigger[1] + trigger[3])
    await app.getByTestId('trigger').click()
    expect(renderer.findByTestId('content')).toBeUndefined()
    await app.getByTestId('trigger').click()
    renderer.simulateKeystrokes('escape')
    renderer.flush()
    expect(renderer.findByTestId('content')).toBeUndefined()
    await app.close()
  })
})

describeNative('DropdownMenu', () => {
  it('walks items with the keyboard and selects with Enter', async () => {
    const selected: string[] = []
    const { render, renderer } = createTestRoot({ width: 800, height: 600 })
    render(
      <div style={{ width: '100%', height: '100%', padding: 40 }}>
        <Menu.Root>
          <Menu.Trigger testId="trigger" style={{ width: 100, height: 30, backgroundColor: '#444' }}>
            {label('Menu')}
          </Menu.Trigger>
          <Menu.Content testId="content" style={{ width: 200, backgroundColor: '#222' }}>
            {['One', 'Two', 'Three'].map((item, index) => (
              <Menu.Item
                key={item}
                testId={`item-${item}`}
                disabled={index === 1}
                onSelect={() => selected.push(item)}
                style={(state) => ({ height: 28, backgroundColor: state.highlighted ? '#555' : '#222' })}
              >
                {label(item)}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Root>
      </div>,
    )
    const app = await connectTest(renderer)
    await app.getByTestId('trigger').click()
    expect(renderer.findByTestId('content')).toBeDefined()
    renderer.simulateKeystrokes('down')
    renderer.simulateKeystrokes('down') // skips the disabled item
    renderer.simulateKeystrokes('enter')
    renderer.flush()
    expect(selected).toEqual(['Three'])
    expect(renderer.findByTestId('content')).toBeUndefined()

    await app.getByTestId('trigger').click()
    await app.getByTestId('item-One').click()
    expect(selected).toEqual(['Three', 'One'])
    await app.close()
  })
})

describeNative('Tabs', () => {
  it('switches on click and on arrow keys', async () => {
    const { render, renderer } = createTestRoot({ width: 800, height: 600 })
    render(
      <div style={{ width: '100%', height: '100%', padding: 40 }}>
        <Tabs.Root defaultValue="a">
          <Tabs.List>
            {['a', 'b', 'c'].map((value) => (
              <Tabs.Trigger key={value} value={value} testId={`tab-${value}`} style={{ width: 60, height: 28 }}>
                {label(value.toUpperCase())}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {['a', 'b', 'c'].map((value) => (
            <Tabs.Content key={value} value={value} testId={`panel-${value}`}>
              {label(`Panel ${value}`)}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>,
    )
    const app = await connectTest(renderer)
    expect(renderer.findByTestId('panel-a')).toBeDefined()
    expect(renderer.findByTestId('panel-b')).toBeUndefined()
    await app.getByTestId('tab-b').click()
    expect(renderer.findByTestId('panel-b')).toBeDefined()
    renderer.simulateKeystrokes('right')
    renderer.flush()
    expect(renderer.findByTestId('panel-c')).toBeDefined()
    renderer.simulateKeystrokes('right')
    renderer.flush()
    expect(renderer.findByTestId('panel-a')).toBeDefined()
    await app.close()
  })
})

describeNative('Checkbox, Switch, RadioGroup, Collapsible', () => {
  it('toggle with click and keyboard', async () => {
    const { render, renderer } = createTestRoot({ width: 800, height: 600 })
    function Form() {
      const [checked, setChecked] = useState(false)
      const [on, setOn] = useState(false)
      const [value, setValue] = useState('x')
      return (
        <div style={{ width: '100%', height: '100%', padding: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Checkbox.Root testId="check" checked={checked} onCheckedChange={setChecked} style={{ width: 20, height: 20, backgroundColor: '#444' }}>
            <Checkbox.Indicator>{label('✓')}</Checkbox.Indicator>
          </Checkbox.Root>
          <Switch.Root testId="switch" checked={on} onCheckedChange={setOn} style={(state) => ({ width: 40, height: 20, backgroundColor: state.checked ? '#0f0' : '#444' })}>
            <Switch.Thumb style={{ width: 16, height: 16 }} />
          </Switch.Root>
          <Radio.Root value={value} onValueChange={setValue}>
            {['x', 'y'].map((item) => (
              <Radio.Item key={item} value={item} testId={`radio-${item}`} style={{ width: 20, height: 20, backgroundColor: '#444' }}>
                <Radio.Indicator>{label('•')}</Radio.Indicator>
              </Radio.Item>
            ))}
          </Radio.Root>
          <Collapsible.Root>
            <Collapsible.Trigger testId="fold" style={{ width: 80, height: 24 }}>
              {label('Fold')}
            </Collapsible.Trigger>
            <Collapsible.Content testId="folded">{label('Hidden')}</Collapsible.Content>
          </Collapsible.Root>
          {label(`checked:${checked} on:${on} value:${value}`)}
        </div>
      )
    }
    render(<Form />)
    const app = await connectTest(renderer)
    await app.getByTestId('check').click()
    expect(renderer.getPaintedText()).toContain('checked:true on:false value:x')
    renderer.simulateKeystrokes('space')
    renderer.flush()
    expect(renderer.getPaintedText()).toContain('checked:false on:false value:x')
    await app.getByTestId('switch').click()
    expect(renderer.getPaintedText()).toContain('checked:false on:true value:x')
    await app.getByTestId('radio-x').click()
    renderer.simulateKeystrokes('down')
    renderer.flush()
    expect(renderer.getPaintedText()).toContain('checked:false on:true value:y')
    expect(renderer.findByTestId('folded')).toBeUndefined()
    await app.getByTestId('fold').click()
    expect(renderer.findByTestId('folded')).toBeDefined()
    await app.close()
  })
})
