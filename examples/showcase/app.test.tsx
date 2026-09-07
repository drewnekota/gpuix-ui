import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { describe, it, expect } from 'vitest'
import { createTestRoot, hasNativeTestRenderer } from '@gpuix/react/testing'
import { connectTest } from '@gpuix/react/automation'
import { Showcase, type Example } from './app'
import { toast } from '@gpuix-ui/react'

const docs = fileURLToPath(new URL('../../docs/examples/', import.meta.url))
fs.mkdirSync(docs, { recursive: true })
const native = hasNativeTestRenderer ? describe : describe.skip

native('example applications', () => {
  for (const dark of [false, true]) {
    for (const page of ['dashboard', 'chat', 'settings'] as Example[]) {
      it(`renders ${page} in ${dark ? 'dark' : 'light'}`, async () => {
        const root = createTestRoot({ width: 1280, height: 900 })
        root.render(<Showcase initialPage={page} initialDark={dark} />)
        const app = await connectTest(root.renderer)
        try {
          if (page === 'chat') {
            await app.getByTestId('composer').fill('What is GPUIX?')
            await app.getByTestId('send').click()
            await app.getByTestId('message-actions').waitFor()
          }
          root.renderer.flush()
          const text = root.renderer.getPaintedText().join('\n')
          expect(text).toContain(page === 'dashboard' ? 'Recent Sales' : page === 'settings' ? 'Username' : 'GPUIX')
          root.renderer.captureScreenshot(`${docs}/${page}-${dark ? 'dark' : 'light'}.png`)
        } finally {
          await app.close()
          root.unmount()
        }
      })
    }
  }

  it('filters customers and updates the chart when changing the period', async () => {
    const root = createTestRoot({ width: 1280, height: 900 })
    root.render(<Showcase />)
    const app = await connectTest(root.renderer)
    try {
      await app.getByTestId('sales-search').fill('Olivia')
      expect(root.renderer.getPaintedText()).toContain('Olivia Martin')
      expect(root.renderer.getPaintedText()).not.toContain('Jackson Lee')
      const before = root.renderer.findByTestId('bar-Jan')!.style.height
      await app.getByTestId('analytics-tab').click()
      expect(root.renderer.getPaintedText()).toContain('Subscription growth')
      expect(root.renderer.findByTestId('bar-Jan')!.style.height).not.toBe(before)
      await app.getByTestId('date-range').click()
      expect(root.renderer.getPaintedText()).toContain('$50,659.72')
    } finally {
      await app.close()
      root.unmount()
    }
  })

  it('keeps the conversation when switching appearance', async () => {
    const root = createTestRoot({ width: 1280, height: 900 })
    root.render(<Showcase initialPage="chat" />)
    const app = await connectTest(root.renderer)
    try {
      await app.getByTestId('composer').fill('What is GPUIX?')
      await app.getByTestId('send').click()
      await app.getByTestId('message-actions').waitFor()
      await app.getByTestId('toggle-theme').click()
      expect(root.renderer.getPaintedText()).toContain('What is GPUIX?')
      expect(root.renderer.findByTestId('message-actions')).toBeDefined()
    } finally {
      await app.close()
      root.unmount()
    }
  })

  it('edits preferences, toggles notifications and changes appearance', async () => {
    const root = createTestRoot({ width: 1280, height: 900 })
    root.render(<Showcase initialPage="settings" />)
    const app = await connectTest(root.renderer)
    try {
      await app.getByTestId('profile-name').fill('Ada Lovelace')
      // Native locator clicks do not auto-scroll. Font metrics differ between
      // macOS runners, so bring the form footer into the viewport explicitly.
      root.renderer.scrollTo(root.renderer.findByTestId('settings-scroll')!.id, 0, -10000)
      await app.getByTestId('save-settings').click()
      await app.getByTestId('saved-state').waitFor()
      expect(root.renderer.getPaintedText()).toContain('Changes saved')
      toast.dismiss()
      root.renderer.scrollTo(root.renderer.findByTestId('settings-scroll')!.id, 0, 0)
      await app.getByTestId('settings-notifications').click()
      const before = root.renderer.findByTestId('notification-0')!.style.backgroundColor
      await app.getByTestId('notification-0').click()
      expect(root.renderer.findByTestId('notification-0')!.style.backgroundColor).not.toBe(before)
      await app.getByTestId('settings-appearance').click()
      await app.getByTestId('appearance-dark').click()
      expect(root.renderer.findByTestId('appearance-dark')!.style.borderWidth).toBe(2)
    } finally {
      toast.dismiss()
      await app.close()
      root.unmount()
    }
  })
})
