/**
 * Drives the chat app through the GPU test renderer: send a message, watch
 * the mock agent stream markdown, open menus and dialogs, switch tabs.
 *
 *   pnpm --filter @gpuix-ui/example-chat test
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { connectTest } from '@gpuix/react/automation'
import { createTestRoot, hasNativeTestRenderer, type TestRenderer } from '@gpuix/react/testing'
import { ChatApp, mockAgent } from './app'

const describeNative = hasNativeTestRenderer ? describe : describe.skip
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'screenshots')

beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

async function waitForPainted(renderer: TestRenderer, needle: string, timeoutMs = 8000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    renderer.flush()
    if (renderer.getPaintedText().join('\n').includes(needle)) return
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
  throw new Error(`"${needle}" never painted. Last frame:\n${renderer.getPaintedText().join('\n')}`)
}

function mount(width = 1180, height = 800) {
  const { render, renderer } = createTestRoot({ width, height })
  render(<ChatApp agent={mockAgent} speed={0} />)
  return renderer
}

describeNative('chat app', () => {
  it('sends a message and streams the mock reply as native markdown', async () => {
    const renderer = mount()
    const app = await connectTest(renderer)
    await app.getByTestId('composer').fill('What is GPUIX?')
    await app.getByTestId('send').click()
    await waitForPainted(renderer, 'What is GPUIX?')
    await waitForPainted(renderer, 'search_docs')
    await waitForPainted(renderer, 'gpuix-ui')
    // The action bar mounts only once streaming has finished.
    await app.getByTestId('message-actions').waitFor()
    renderer.flush()
    // The reply is a single native <markdown> element, not a tree of <text>.
    expect(renderer.findByType('markdown').length).toBe(1)
    // The conversation took its title from the first message.
    expect(renderer.getPaintedText().filter((line) => line === 'What is GPUIX?').length).toBeGreaterThanOrEqual(2)
    renderer.captureScreenshot(path.join(SHOTS, 'chat-reply.png'))
    await app.close()
  })

  it('opens the header menu and the rename dialog, then closes it with Escape', async () => {
    const renderer = mount()
    const app = await connectTest(renderer)
    await app.getByTestId('header-menu').click()
    await app.getByTestId('menu-rename').waitFor()
    await app.getByTestId('menu-rename').click()
    await app.getByTestId('rename-input').waitFor()
    expect(renderer.getPaintedText()).toContain('Rename chat')
    renderer.captureScreenshot(path.join(SHOTS, 'chat-rename-dialog.png'))
    renderer.simulateKeystrokes('escape')
    renderer.flush()
    expect(renderer.findByTestId('rename-input')).toBeUndefined()
    await app.close()
  })

  it('renames through the dialog', async () => {
    const renderer = mount()
    const app = await connectTest(renderer)
    await app.getByTestId('header-menu').click()
    await app.getByTestId('menu-rename').click()
    await app.getByTestId('rename-input').fill('Planning session')
    await app.getByTestId('rename-save').click()
    renderer.flush()
    expect(renderer.getPaintedText()).toContain('Planning session')
    expect(renderer.findByTestId('rename-input')).toBeUndefined()
    await app.close()
  })

  it('opens settings, switches tabs, and flips the theme', async () => {
    const renderer = mount()
    const app = await connectTest(renderer)
    await app.getByTestId('settings').click()
    await app.getByTestId('tab-model').waitFor()
    expect(renderer.getPaintedText()).toContain('Dark appearance')
    await app.getByTestId('tab-model').click()
    await app.getByTestId('speed-slow').waitFor()
    await app.getByTestId('speed-slow').click()
    await app.getByTestId('tab-general').click()
    const before = renderer.findByTestId('theme-switch')!.style.backgroundColor
    await app.getByTestId('theme-switch').click()
    renderer.flush()
    expect(renderer.findByTestId('theme-switch')!.style.backgroundColor).not.toBe(before)
    renderer.captureScreenshot(path.join(SHOTS, 'chat-settings-light.png'))
    // The dialog is still open after interacting inside it.
    expect(renderer.getPaintedText()).toContain('Settings')
    await app.getByTestId('dialog-close').click()
    renderer.flush()
    expect(renderer.findByTestId('tab-general')).toBeUndefined()
    await app.close()
  })

  it('creates and deletes conversations', async () => {
    const renderer = mount()
    const app = await connectTest(renderer)
    await app.getByTestId('composer').fill('hello')
    await app.getByTestId('send').click()
    await waitForPainted(renderer, 'demo agent')
    await app.getByTestId('new-chat').click()
    renderer.flush()
    expect(renderer.getPaintedText().filter((line) => line === 'New chat').length).toBeGreaterThanOrEqual(1)
    expect(renderer.getPaintedText()).toContain('hello')
    // Delete the fresh chat through the header menu and confirm.
    await app.getByTestId('header-menu').click()
    await app.getByTestId('menu-delete').click()
    await app.getByTestId('delete-confirm').waitFor()
    expect(renderer.getPaintedText()).toContain('Delete this chat?')
    await app.getByTestId('delete-confirm').click()
    renderer.flush()
    expect(renderer.findByTestId('delete-confirm')).toBeUndefined()
    // The remaining conversation is the one with the message.
    await waitForPainted(renderer, 'hello')
    await app.close()
  })

  it('stops a streaming reply', async () => {
    const { render, renderer } = createTestRoot({ width: 1180, height: 800 })
    render(<ChatApp agent={mockAgent} speed={40} />)
    const app = await connectTest(renderer)
    await app.getByTestId('composer').fill('show me a code example')
    await app.getByTestId('send').click()
    await app.getByTestId('stop').waitFor()
    await app.getByTestId('stop').click()
    await app.getByTestId('send').waitFor()
    await app.close()
  })
})
