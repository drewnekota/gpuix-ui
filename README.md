# gpuix-ui

shadcn-style components for [GPUIX](https://gpuix.dev), the React renderer for Zed's GPU-accelerated UI framework. Native windows, no web view, no CSS. Copy the source into your app or import it from a package.

## Examples

Three runnable native applications using the same components below. Start with `pnpm install`, `pnpm fonts:install`, then `pnpm examples`.

### Dashboard

Revenue cards, a monthly chart, searchable recent sales, and a period switcher. Inspired by the [classic shadcn dashboard](https://v3.shadcn.com/examples/dashboard).

![Dashboard — light](docs/examples/dashboard-light.png)

<details><summary>Dark appearance</summary>

![Dashboard — dark](docs/examples/dashboard-dark.png)

</details>

### Agent Chat

Working conversation history, streamed Markdown, tool calls, model selection, composer, and settings. Uses the existing [chat example](examples/chat/app.tsx); the showcase runs the local demo agent without credentials.

![Agent Chat — dark](docs/examples/chat-dark.png)

<details><summary>Light appearance</summary>

![Agent Chat — light](docs/examples/chat-light.png)

</details>

### Settings

Editable profile, account, appearance, and notification preferences. Changes last for the current demo session. Inspired by [shadcn forms](https://v3.shadcn.com/examples/forms).

![Settings — light](docs/examples/settings-light.png)

<details><summary>Dark appearance</summary>

![Settings — dark](docs/examples/settings-dark.png)

</details>

[Example source](examples/showcase/app.tsx) · [Visual baseline and native differences](docs/visual-baseline.md)

## Architecture

Three layers, the same split as shadcn/ui:

| Package | Role | shadcn equivalent |
|---|---|---|
| `@gpuix-ui/core` | Theme tokens, `sv()` style variants, `sx()` merge, colour helpers | CSS variables + `cva` + `cn` |
| `@gpuix-ui/primitives` | Headless behaviour: Dialog, Popover, DropdownMenu, ContextMenu, Menubar, Command, Tabs, Accordion, Slider, Checkbox, Switch, RadioGroup, Collapsible | Radix + cmdk |
| `@gpuix-ui/react` | Styled components, also published as a copy-paste registry | `components/ui/*` |

GPUIX already ships headless Select, Combobox, and Tooltip. gpuix-ui styles those and adds the primitives it is missing.

## Quick start

```bash
bunx @gpuix/cli new my-app && cd my-app
pnpm add @gpuix-ui/core @gpuix-ui/primitives @gpuix-ui/react
```

```tsx
import { render } from '@gpuix/react'
import { ThemeProvider, darkTheme } from '@gpuix-ui/core'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Text } from '@gpuix-ui/react'

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div style={{ width: '100%', height: '100%', padding: 24, backgroundColor: darkTheme.colors.background }}>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hello from the GPU</DialogTitle>
            </DialogHeader>
            <Text tone="muted">No web view was harmed.</Text>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  )
}

render(<App />, { title: 'My App', width: 800, height: 600 })
```

Or copy the source in, shadcn style, and own it:

```bash
bunx gpuix-ui add button dialog dropdown-menu   # writes components/ui/*.tsx
bunx gpuix-ui add --all
```

The registry is plain JSON under [`r/`](./r) built from `packages/ui/src`, so a file you copied is the same file the package ships.

## Components

Every image below is painted by GPUI through the test renderer (`packages/ui/src/docs.test.tsx`), so the screenshots are what the components look like, not mockups. Each component has dark and light captures, including the variants and states shown. Expand “Light appearance” to compare. Native editor focus rings are illustrated explicitly because the offscreen renderer does not emit editor focus events.

| | |
|---|---|
| ![Dark theme](docs/components/theme-dark.png) | ![Light theme](docs/components/theme-light.png) |

### Button

default, secondary, outline, ghost, destructive, link. Sizes xs to lg plus icon sizes. `asChild` merges into a child element.

![Button](docs/components/button.png)

<details><summary>Light appearance</summary>

![Button — light](docs/components/button-light.png)

</details>

### Badge

default, secondary, outline, destructive, success.

![Badge](docs/components/badge.png)

<details><summary>Light appearance</summary>

![Badge — light](docs/components/badge-light.png)

</details>

### Text

The typographic base every component paints strings through. `size`, `tone`, `weight`, `mono`, `truncate`.

![Text](docs/components/text.png)

<details><summary>Light appearance</summary>

![Text — light](docs/components/text-light.png)

</details>

### Input

Native GPUI editor with IME, selection, and undo. `leading` / `trailing` slots, focus ring, disabled.

![Input](docs/components/input.png)

<details><summary>Light appearance</summary>

![Input — light](docs/components/input-light.png)

</details>

### Textarea

Multi-line editor with `minRows` / `maxRows` and an `unstyled` mode for composers.

![Textarea](docs/components/textarea.png)

<details><summary>Light appearance</summary>

![Textarea — light](docs/components/textarea-light.png)

</details>

### Checkbox

Unchecked, checked, indeterminate, disabled.

![Checkbox](docs/components/checkbox.png)

<details><summary>Light appearance</summary>

![Checkbox — light](docs/components/checkbox-light.png)

</details>

### Switch

Two sizes; the thumb is `pointerEvents: none` so presses reach the track.

![Switch](docs/components/switch.png)

<details><summary>Light appearance</summary>

![Switch — light](docs/components/switch-light.png)

</details>

### RadioGroup

Arrow keys move the selection; disabled items are skipped.

![RadioGroup](docs/components/radio-group.png)

<details><summary>Light appearance</summary>

![RadioGroup — light](docs/components/radio-group-light.png)

</details>

### Toggle

Pressed-state button, default or outline.

![Toggle](docs/components/toggle.png)

<details><summary>Light appearance</summary>

![Toggle — light](docs/components/toggle-light.png)

</details>

### Label, Kbd, Separator

Small pieces.

![Label, Kbd, Separator](docs/components/label-kbd-separator.png)

<details><summary>Light appearance</summary>

![Label, Kbd, Separator — light](docs/components/label-kbd-separator-light.png)

</details>

### Avatar

Image or initials. "Ada Lovelace" becomes "AL", "You" becomes "Y".

![Avatar](docs/components/avatar.png)

<details><summary>Light appearance</summary>

![Avatar — light](docs/components/avatar-light.png)

</details>

### Skeleton, Progress, Spinner

Loading states. Spinner pulses three dots because native motion has no rotation.

![Skeleton, Progress, Spinner](docs/components/skeleton-progress-spinner.png)

<details><summary>Light appearance</summary>

![Skeleton, Progress, Spinner — light](docs/components/skeleton-progress-spinner-light.png)

</details>

### Alert

default, warning, destructive.

![Alert](docs/components/alert.png)

<details><summary>Light appearance</summary>

![Alert — light](docs/components/alert-light.png)

</details>

### Card

Header, title, description, content, footer.

![Card](docs/components/card.png)

<details><summary>Light appearance</summary>

![Card — light](docs/components/card-light.png)

</details>

### Tabs

Segmented list with arrow-key navigation.

![Tabs](docs/components/tabs.png)

<details><summary>Light appearance</summary>

![Tabs — light](docs/components/tabs-light.png)

</details>

### Accordion

Single or multiple open, `collapsible`, disabled items.

![Accordion](docs/components/accordion.png)

<details><summary>Light appearance</summary>

![Accordion — light](docs/components/accordion-light.png)

</details>

### Collapsible

Show/hide content in place.

![Collapsible](docs/components/collapsible.png)

<details><summary>Light appearance</summary>

![Collapsible — light](docs/components/collapsible-light.png)

</details>

### ScrollArea

One native scroller. GPUI does not nest vertical scrollers.

![ScrollArea](docs/components/scroll-area.png)

<details><summary>Light appearance</summary>

![ScrollArea — light](docs/components/scroll-area-light.png)

</details>

### Slider

Drag the thumb, press the track, or use arrow keys. Takes its pixel `width` because there is no bounds API.

![Slider](docs/components/slider.png)

<details><summary>Light appearance</summary>

![Slider — light](docs/components/slider-light.png)

</details>

### Table

Flex rows. Cells share the row equally or take a fixed `width`. Hover wash and `selected` rows.

![Table](docs/components/table.png)

<details><summary>Light appearance</summary>

![Table — light](docs/components/table-light.png)

</details>

### Breadcrumb

Links, separators, an ellipsis, and the current page.

![Breadcrumb](docs/components/breadcrumb.png)

<details><summary>Light appearance</summary>

![Breadcrumb — light](docs/components/breadcrumb-light.png)

</details>

### Pagination

`paginationRange()` computes the ellipses; `SimplePagination` wires previous, pages, and next.

![Pagination](docs/components/pagination.png)

<details><summary>Light appearance</summary>

![Pagination — light](docs/components/pagination-light.png)

</details>

### Select

Over `@gpuix/react/select`. Groups, item descriptions, disabled items, outline or ghost trigger.

![Select](docs/components/select.png)

<details><summary>Light appearance</summary>

![Select — light](docs/components/select-light.png)

</details>

### DropdownMenu

Items with shortcuts, checkbox items, radio groups, labels, separators, destructive items. Arrows, Home, End, Enter, Escape.

![DropdownMenu](docs/components/dropdown-menu.png)

<details><summary>Light appearance</summary>

![DropdownMenu — light](docs/components/dropdown-menu-light.png)

</details>

### ContextMenu

Right-click menu at the pointer, same items as DropdownMenu.

![ContextMenu](docs/components/context-menu.png)

<details><summary>Light appearance</summary>

![ContextMenu — light](docs/components/context-menu-light.png)

</details>

### Menubar

Once one menu is open, hovering another trigger switches to it.

![Menubar](docs/components/menubar.png)

<details><summary>Light appearance</summary>

![Menubar — light](docs/components/menubar-light.png)

</details>

### Popover

Anchored floating panel that flips to fit the window.

![Popover](docs/components/popover.png)

<details><summary>Light appearance</summary>

![Popover — light](docs/components/popover-light.png)

</details>

### Tooltip

Over `@gpuix/react/tooltip`.

![Tooltip](docs/components/tooltip.png)

<details><summary>Light appearance</summary>

![Tooltip — light](docs/components/tooltip-light.png)

</details>

### Dialog

Full-window overlay, centred or top-anchored panel, Escape and outside press to close.

![Dialog](docs/components/dialog.png)

<details><summary>Light appearance</summary>

![Dialog — light](docs/components/dialog-light.png)

</details>

### AlertDialog

A Dialog that ignores outside presses. Action and Cancel are Buttons.

![AlertDialog](docs/components/alert-dialog.png)

<details><summary>Light appearance</summary>

![AlertDialog — light](docs/components/alert-dialog-light.png)

</details>

### Sheet

A Dialog docked to the left, right, top, or bottom edge.

![Sheet](docs/components/sheet.png)

<details><summary>Light appearance</summary>

![Sheet — light](docs/components/sheet-light.png)

</details>

### Command

cmdk-shaped palette: fuzzy filter, groups that hide when empty, disabled items, Enter selects the highlighted item.

![Command](docs/components/command.png)

<details><summary>Light appearance</summary>

![Command — light](docs/components/command-light.png)

</details>

### CommandDialog

The same Command inside a top-anchored Dialog. Selecting an item closes it.

![CommandDialog](docs/components/command-dialog.png)

<details><summary>Light appearance</summary>

![CommandDialog — light](docs/components/command-dialog-light.png)

</details>

### Toast

`toast()`, `toast.success()`, `toast.warning()`, `toast.error()` from anywhere, including outside React. One `<Toaster />` renders the stack.

![Toast](docs/components/toast.png)

<details><summary>Light appearance</summary>

![Toast — light](docs/components/toast-light.png)

</details>

### Icons

The inline Lucide set the components use, plus `<Icon source>` for your own SVG.

![Icons](docs/components/icons.png)

<details><summary>Light appearance</summary>

![Icons — light](docs/components/icons-light.png)

</details>

## Theming

A theme is a plain object with the same names as shadcn's CSS variables. Components read it from context, and every `<text>` they paint takes a colour from it, because GPUI does not inherit `color`.

```tsx
import { createTheme, darkTheme, ThemeProvider } from '@gpuix-ui/core'

const brand = createTheme(darkTheme, { colors: { primary: '#7C86FF', primaryForeground: '#0A0A0A' }, radius: { md: 8 } })

<ThemeProvider theme={brand}>...</ThemeProvider>
```

`toGpuixTheme(theme)` produces the native theme for `<markdown>`, `<code>`, `<diff>`, and inputs, so those match the rest of the window.

## Variants

`sv()` is `cva` for style objects. Variant values are styles, `hover` and `active` merge instead of replace, and the theme is closed over by a factory you memoise with `useVariants`.

```tsx
const chip = (t: Theme) =>
  sv({
    base: { display: 'flex', alignItems: 'center', height: 24, paddingLeft: 8, paddingRight: 8, borderRadius: t.radius.full },
    variants: {
      tone: {
        neutral: { backgroundColor: t.colors.secondary },
        danger: { backgroundColor: withAlpha(t.colors.destructive, 0.2) },
      },
    },
    defaultVariants: { tone: 'neutral' },
  })

function Chip({ tone, children }) {
  const styles = useVariants(chip)
  const t = useTheme()
  return <div style={styles({ tone })}><Text size="xs">{children}</Text></div>
}
```

## Example: agent chat

[`examples/chat`](./examples/chat) is a full chat app: sidebar with search and per-row menus, transcript in a `<virtual-list>` with native markdown, thinking folds and tool cards, a composer with a model picker, a settings dialog with tabs, rename and delete dialogs, light and dark themes. A mock agent streams canned answers; set `ANTHROPIC_API_KEY` and pick a Claude model to stream from the Claude API through the official SDK.

```bash
pnpm install
pnpm fonts:install                # bundled Geist, SIL Open Font License
pnpm examples                     # dashboard, agent chat, settings
pnpm chat                         # bun --hot examples/chat/app.tsx
pnpm --filter @gpuix-ui/example-chat test
```

## How the primitives work on GPUI

- **Overlays** render into `<anchored deferred>`, which GPUI paints in a later pass over everything, including virtual lists. Dialog uses `position: {x: 0, y: 0}`, which is window-absolute, so no portal is needed.
- **Dismissal** uses `onMouseDownOutside`. GPUI does not bubble mouse events, so a backdrop `onMouseDown` cannot see a press that landed on the panel.
- **Keyboard** goes through native focus: content panels are `tabIndex={0}` with `autoFocus`, and focus returns to the trigger on close through `renderer.focusElement`.
- **Item registries** (menus, tabs, radios) register in mount order, so arrow keys work without the parent inspecting its children.

## Development

```bash
pnpm install
pnpm fonts:install
pnpm typecheck
pnpm test              # GPU test renderer, offscreen, no window
pnpm registry:build    # regenerate registry.json and r/
```

Tests use `createTestRoot()` from `@gpuix/react/testing`: they lay out and paint through real GPUI, click by painted bounds, and screenshot into `screenshots/`.

## Publishing

`pnpm -r build` compiles each package to `dist/` (JS + `.d.ts`). The workspace resolves `src/` directly; `publishConfig` points the published tarball at `dist/`. Tags matching `v*` trigger `.github/workflows/release.yml`, which runs the tests and publishes `@gpuix-ui/core`, `@gpuix-ui/primitives`, `@gpuix-ui/react`, and the `gpuix-ui` CLI with npm provenance. It needs an `NPM_TOKEN` repository secret.

## Status

Early. Built against `@gpuix/react` 0.7 (pinned as `^0.7.0` because the element API is still moving). macOS is exercised; Windows and Linux are untested. See [AGENTS.md](./AGENTS.md) for the rules an agent should follow when building with or on this library.

MIT
