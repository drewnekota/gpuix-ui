/**
 * Launch the app behind your editor and save a screenshot.
 *   bun screenshot.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { launch } from '@gpuix/react/automation'

const here = path.dirname(fileURLToPath(import.meta.url))
const app = await launch({ command: 'bun', args: ['app.tsx'], cwd: here, env: { GPUIX_BACKGROUND: '1' } })
try {
  await app.getByTestId('composer').waitFor({ timeoutMs: 30_000 })
  await app.getByTestId('composer').fill('What is GPUIX?')
  await app.getByTestId('send').click()
  await new Promise((resolve) => setTimeout(resolve, 6000))
  const out = path.join(here, 'screenshots', 'chat.png')
  await app.screenshot({ path: out })
  console.log(`saved ${out}`)
} finally {
  await app.close()
}
