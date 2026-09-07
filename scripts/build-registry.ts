/**
 * Build the shadcn-compatible registry from packages/ui/src.
 *
 *   bun scripts/build-registry.ts
 *
 * Writes registry.json (index) and r/<name>.json (one item per component,
 * source inlined) so `gpuix-ui add <name>` can fetch them from GitHub raw.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'packages', 'ui', 'src')
const out = path.join(root, 'r')
mkdirSync(out, { recursive: true })

const RAW = 'https://raw.githubusercontent.com/drewnekota/gpuix-ui/main'

const DESCRIPTIONS: Record<string, string> = {
  text: 'Themed text. The typographic base every other component paints strings through.',
  icons: 'Inline Lucide icons the components depend on, plus an <Icon> element.',
  button: 'Button with default, secondary, outline, ghost, destructive, and link variants.',
  input: 'Single-line native text field with focus ring and leading/trailing slots.',
  textarea: 'Auto-growing native multiline editor.',
  label: 'Form label text.',
  badge: 'Small status pill.',
  avatar: 'Round image with an initials fallback.',
  card: 'Bordered surface with header, content, and footer slots.',
  separator: 'One-pixel rule, horizontal or vertical.',
  kbd: 'Keyboard shortcut chip.',
  skeleton: 'Loading placeholder block.',
  progress: 'Horizontal progress bar.',
  spinner: 'Three pulsing dots. GPUI motion cannot rotate, so no ring.',
  alert: 'Callout with icon, title, and description.',
  tooltip: 'Hover label over @gpuix/react/tooltip.',
  select: 'Styled select over @gpuix/react/select with groups and descriptions.',
  'dropdown-menu': 'Menu with items, checkbox items, radio items, labels, separators, shortcuts.',
  dialog: 'Modal dialog with overlay, header, footer, and close button.',
  'alert-dialog': 'Confirmation dialog that ignores outside presses.',
  popover: 'Floating panel anchored to a trigger.',
  tabs: 'Segmented tab list with keyboard navigation.',
  'scroll-area': 'Native scroll container.',
  switch: 'On/off toggle.',
  checkbox: 'Checkbox with indeterminate state.',
  'radio-group': 'Exclusive choice group.',
  collapsible: 'Show/hide content in place.',
  toggle: 'Pressed-state button.',
  command: 'Command palette: fuzzy search, groups, keyboard navigation, and a CommandDialog.',
  sheet: 'Dialog docked to a window edge.',
  toast: 'Imperative toast() store and a Toaster that renders the stack in a window-absolute layer.',
  table: 'Flex-row table with header, body, footer, selected rows, and fixed or shared column widths.',
  slider: 'Draggable slider with keyboard support. Needs its pixel width, GPUIX has no bounds API.',
  accordion: 'Single or multiple open sections.',
  'context-menu': 'Right-click menu positioned at the pointer.',
  menubar: 'Horizontal menu bar that switches menus on hover once one is open.',
  breadcrumb: 'Path trail with links, separators, and an ellipsis.',
  pagination: 'Page links with previous/next, plus paginationRange() and a wired-up SimplePagination.',
}

const INTERNAL = new Set(['internal', 'index'])

function titleCase(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface RegistryFile {
  path: string
  type: string
  target: string
  content: string
}

const files = readdirSync(src).filter((file) => file.endsWith('.tsx') && !file.endsWith('.test.tsx'))
const internal = readFileSync(path.join(src, 'internal.tsx'), 'utf8')

const items = files.flatMap((file) => {
  const name = file.replace(/\.tsx$/, '')
  if (INTERNAL.has(name)) return []
  const content = readFileSync(path.join(src, file), 'utf8')
  const localDeps = [...content.matchAll(/from '\.\/([a-z-]+)'/g)].map((match) => match[1]!).filter((dep) => !INTERNAL.has(dep))
  const dependencies = ['@gpuix-ui/core', '@gpuix-ui/primitives'].filter((dep) => content.includes(dep))
  const itemFiles: RegistryFile[] = [{ path: `registry/ui/${file}`, type: 'registry:ui', target: `components/ui/${file}`, content }]
  if (content.includes("from './internal'")) {
    itemFiles.push({ path: 'registry/ui/internal.tsx', type: 'registry:ui', target: 'components/ui/internal.tsx', content: internal })
  }
  return [
    {
      name,
      type: 'registry:ui',
      title: titleCase(name),
      description: DESCRIPTIONS[name] ?? '',
      dependencies,
      registryDependencies: [...new Set(localDeps)].map((dep) => `${RAW}/r/${dep}.json`),
      files: itemFiles,
    },
  ]
})

for (const item of items) {
  writeFileSync(path.join(out, `${item.name}.json`), JSON.stringify({ $schema: 'https://ui.shadcn.com/schema/registry-item.json', ...item }, null, 2))
}
const index = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'gpuix-ui',
  homepage: 'https://github.com/drewnekota/gpuix-ui',
  items: items.map(({ files: itemFiles, ...rest }) => ({ ...rest, files: itemFiles.map(({ content: _content, ...file }) => file) })),
}
writeFileSync(path.join(root, 'registry.json'), JSON.stringify(index, null, 2))
console.log(`wrote registry.json and ${items.length} items to r/`)
