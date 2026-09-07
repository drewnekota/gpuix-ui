# AGENTS.md

Guide for agents building apps with gpuix-ui, or changing gpuix-ui itself. Read the [GPUIX README](https://github.com/remorses/gpuix#readme) first for the renderer's own rules; the ones that bite most often are repeated here.

## Building an app with gpuix-ui

Start from the example, not from scratch: `examples/chat/app.tsx` shows a sidebar, header menu, virtual-list transcript, composer, and three dialogs wired together.

Rules that GPUI enforces and this library assumes:

1. **Every `<text>` needs a `color`.** Nothing is inherited. Use `<Text>` from `@gpuix-ui/react`, or `asText(children, style)` when a component takes string children.
2. **One vertical scroller per screen.** A `<virtual-list>`, `ScrollArea`, or `overflow: 'scroll'` div must not contain another one. Horizontal `overflowX` is fine.
3. **Overlays must go through the primitives.** `DialogContent`, `PopoverContent`, `DropdownMenuContent`, `SelectContent`, `TooltipContent` render into `<anchored deferred>`. A `position: 'absolute'` card paints under a virtual list and still receives the wheel from whatever is behind it.
4. **Overlay fills are opaque.** `theme.colors.popover` and `theme.colors.background` are opaque on purpose. A translucent fill on a blurred window punches through to the desktop.
5. **A filled child blocks clicks on its parent.** Decorative children of a clickable element (switch thumb, radio dot, progress fill) need `pointerEvents: 'none'`. Icons rendered with `<svg>` do not block.
6. **Mouse events do not bubble.** Put the handler on the element that is hit. Use `onMouseDownOutside` for dismissal.
7. **Styles are objects.** `sx(a, cond && b, props.style)` replaces `cn()`. `hover` and `active` nest one level and merge.
8. **Native motion animates only width, height, opacity, radius, and edges.** There is no rotation; `Spinner` pulses dots.
9. **Fonts are platform names.** The theme defaults to Helvetica / Segoe UI / Noto Sans. Set `theme.font.sans` to a family the OS has.
10. **`render()` once, at the end of the entry file**, guarded by an entry-point check so tests can import the app.
11. **Enter in a native `<input>` arrives as `onSubmit`, not `onKeyDown`.** Arrow keys and Escape do reach `onKeyDown`. `CommandInput` wires both.
12. **Right click is `onMouseDown` with `button === 2`** (or `onAuxClick` with `isRightClick`). `ContextMenuTrigger` handles it; `onClick` is the primary button only.
13. **Nothing measures itself.** There is no bounds API from JS, so `Slider` takes a pixel `width` and `Toaster` positions from `useWindowSize()`.
14. **Toasts are a module store.** Call `toast()` from anywhere, including outside React; render one `<Toaster />` near the root.

Text inside a `div` must be a `<text>` element. A bare string child of a `div` is not painted.

## Testing what you built

Use the GPU test renderer. It opens no window and runs the real layout and paint:

```tsx
import { createTestRoot } from '@gpuix/react/testing'
import { connectTest } from '@gpuix/react/automation'

const { render, renderer } = createTestRoot({ width: 1180, height: 800 })
render(<App />)
const app = await connectTest(renderer)
await app.getByTestId('send').click()
renderer.getPaintedText()            // every string painted last frame, markdown included
renderer.captureScreenshot('x.png')  // look at it
```

`renderer.simulateKeystrokes('escape')` sends keys to whatever holds focus. `renderer.findByTestId(id)?.style` is the resolved style object, useful for asserting a theme change. Screenshots are the fastest way to catch a black-on-black text or a menu under a list.

To drive the live window without stealing focus: `GPUIX_BACKGROUND=1 bun app.tsx`, then `launch()` from `@gpuix/react/automation`.

## Changing gpuix-ui

- Declarations must build: `pnpm build` runs `tsc -p tsconfig.build.json` per package. Types that come from `@gpuix/react` internals (`PublicInstance`, `JSX.IntrinsicElements['div']`) are wrapped in exported interfaces (`Instance`, `DivProps`) so emitted `.d.ts` files name them instead of reaching into `@gpuix/react/dist`. If `tsc` reports TS2742 "cannot be named without a reference", add an explicit type annotation or wrap the type the same way.

- Keep the three layers separate. Behaviour goes in `packages/primitives`, styling in `packages/ui`, tokens and variants in `packages/core`.
- A styled component's file must stay self-contained enough to copy: it may import `@gpuix-ui/core`, `@gpuix-ui/primitives`, `@gpuix/react/*`, and sibling files by relative path. Nothing else.
- Run `bun scripts/build-registry.ts` after adding or renaming a component, and add a description to `DESCRIPTIONS` in that script.
- Every primitive gets a test in `packages/primitives/src/primitives.test.tsx` that opens, navigates by keyboard, and dismisses. Every styled component appears in the gallery in `packages/ui/src/ui.test.tsx`.
- `Select` rewrites `<SelectItem>` into the GPUIX primitive item, because the primitive finds items by component identity. If you wrap another GPUIX primitive that walks its children (Combobox does too), follow the same pattern in `select.tsx`.
- Do not paper over GPUI. If something needs a native change, it belongs upstream in GPUIX; open an issue there (their AGENTS.md asks for issues, not PRs, from outside contributors).

## Commands

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm chat
pnpm registry:build
```
