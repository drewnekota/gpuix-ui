#!/usr/bin/env bun
/**
 * gpuix-ui: copy components into your GPUIX app, shadcn style.
 *
 *   gpuix-ui add button dialog dropdown-menu
 *   gpuix-ui add --all
 *   gpuix-ui list
 *
 * Reads the registry from GitHub raw (or GPUIX_UI_REGISTRY for a local path),
 * writes each file under components/ui/, and follows registry dependencies.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const REGISTRY = process.env.GPUIX_UI_REGISTRY ?? 'https://raw.githubusercontent.com/drewnekota/gpuix-ui/main'

interface RegistryFile {
  path: string
  target: string
  content: string
}
interface RegistryItem {
  name: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: RegistryFile[]
}

async function fetchJson<T>(location: string): Promise<T> {
  if (!/^https?:/.test(REGISTRY)) return JSON.parse(readFileSync(path.join(REGISTRY, location), 'utf8')) as T
  const response = await fetch(`${REGISTRY}/${location}`)
  if (!response.ok) throw new Error(`${response.status} fetching ${REGISTRY}/${location}`)
  return (await response.json()) as T
}

function nameFromRef(ref: string): string {
  return path.basename(ref).replace(/\.json$/, '')
}

async function add(names: string[], options: { dir: string; overwrite: boolean }) {
  const seen = new Set<string>()
  const queue = [...names]
  const packages = new Set<string>()
  while (queue.length) {
    const name = queue.shift()!
    if (seen.has(name)) continue
    seen.add(name)
    const item = await fetchJson<RegistryItem>(`r/${name}.json`)
    for (const dep of item.registryDependencies) queue.push(nameFromRef(dep))
    for (const dep of item.dependencies) packages.add(dep)
    for (const file of item.files) {
      const target = path.join(options.dir, path.basename(file.target))
      if (existsSync(target) && !options.overwrite) {
        console.log(`skip  ${target} (exists; pass --overwrite)`)
        continue
      }
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, file.content)
      console.log(`write ${target}`)
    }
  }
  if (packages.size) console.log(`\nInstall the runtime packages:\n  pnpm add ${[...packages].join(' ')}`)
}

async function list() {
  const index = await fetchJson<{ items: RegistryItem[] }>('registry.json')
  for (const item of index.items) console.log(`${item.name.padEnd(16)} ${item.description}`)
}

const [command, ...rest] = process.argv.slice(2)
const flags = new Set(rest.filter((arg) => arg.startsWith('--')))
const args = rest.filter((arg) => !arg.startsWith('--'))
const dirFlag = rest.find((arg) => arg.startsWith('--dir='))
const dir = dirFlag ? dirFlag.slice('--dir='.length) : 'components/ui'

if (command === 'add') {
  const names = flags.has('--all') ? (await fetchJson<{ items: RegistryItem[] }>('registry.json')).items.map((item) => item.name) : args
  if (names.length === 0) {
    console.error('usage: gpuix-ui add <component...> [--all] [--overwrite] [--dir=components/ui]')
    process.exit(1)
  }
  await add(names, { dir, overwrite: flags.has('--overwrite') })
} else if (command === 'list') {
  await list()
} else {
  console.log(`gpuix-ui: shadcn-style components for GPUIX

  gpuix-ui add <component...>   copy components into components/ui/
  gpuix-ui add --all            copy every component
  gpuix-ui list                 show the registry

Flags: --overwrite  --dir=<path>
Env:   GPUIX_UI_REGISTRY=<local repo path or base URL>`)
}
