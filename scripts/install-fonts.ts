/** Install the bundled SIL Open Font License font for native GPUI text. */
import { copyFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
const directory =
  process.platform === 'darwin'
    ? resolve(homedir(), 'Library/Fonts')
    : process.platform === 'win32'
      ? resolve(process.env.LOCALAPPDATA!, 'Microsoft/Windows/Fonts')
      : resolve(homedir(), '.local/share/fonts')
mkdirSync(directory, { recursive: true })
copyFileSync(new URL('../assets/fonts/Geist.ttf', import.meta.url), resolve(directory, 'Geist.ttf'))
if (process.platform === 'linux') Bun.spawnSync(['fc-cache', '-f', directory])
if (process.platform === 'win32') {
  const result = Bun.spawnSync([
    'reg',
    'add',
    'HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts',
    '/v',
    'Geist (TrueType)',
    '/t',
    'REG_SZ',
    '/d',
    resolve(directory, 'Geist.ttf'),
    '/f',
  ])
  if (result.exitCode !== 0) throw new Error('Could not register Geist with Windows')
}
console.log(`Installed Geist in ${directory}. Restart running GPUIX apps to load it.`)
