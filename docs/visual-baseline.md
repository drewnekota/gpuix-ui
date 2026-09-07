# Visual baseline

The component baseline is **shadcn/ui New York v4, Neutral, Geist**, pinned to
[shadcn-ui/ui `5c7072d`](https://github.com/shadcn-ui/ui/tree/5c7072da672b0048bc6771e3204063a2537df91a/apps/v4/registry/new-york-v4/ui).
The website now offers several styles; its current documentation preview uses
different dimensions from the New York registry. Do not mix those styles in one
component family.

## Tokens and geometry

| Element | Baseline |
| --- | --- |
| Font | Geist, bundled under the SIL Open Font License in `assets/fonts/` |
| Control text | 14px / 20px, weight 500 for buttons and tabs |
| Small labels and badges | 12px / 16px |
| Body | 16px / 24px |
| Button | 36px default; 24 / 32 / 40px extra-small / small / large |
| Input / select | 36px default, 32px small |
| Focus | Ring border plus a 3px ring at 50% opacity |
| Radius | 6 / 8 / 10 / 14px (base radius 10px) |
| Card | 24px vertical padding, horizontal inset and section gap |
| Checkbox / radio | 16px; checkbox corner radius 4px |
| Switch | 32 × 18.4px, 16px thumb |
| Light surfaces | White background/card, #f5f5f5 secondary, #e5e5e5 border |
| Dark surfaces | #0a0a0a background, #171717 card/popover/sidebar, #262626 secondary |
| Dark primary | #e5e5e5 with #171717 foreground |

The dashboard composition follows the [classic dashboard example](https://v3.shadcn.com/examples/dashboard),
and settings follows the [forms example](https://v3.shadcn.com/examples/forms).
The agent chat applies the same tokens to the existing functional native chat;
it is an original composition rather than an official shadcn chat block.

## Reproduce the screenshots

```sh
pnpm install --frozen-lockfile
pnpm fonts:install
pnpm test
pnpm examples
```

`fonts:install` installs the bundled font in the current user's font directory.
Restart existing native applications after installing it. On macOS, the font
resolves to `Geist-Regular` from `~/Library/Fonts/Geist.ttf`. Applications that
do not install Geist should explicitly supply an available font through
`createTheme()`; otherwise the native renderer chooses a fallback.

`packages/ui/src/docs.test.tsx` paints every documented component in both themes.
It measures ordinary specimens before capture and drives menus, pressed states,
and hover states through the GPU test renderer. The editor focus specimen is
explicitly styled because offscreen native editors do not emit focus events.
`examples/showcase/app.test.tsx` paints all three full applications in both themes
and exercises customer filtering, chart switching, profile editing, notifications,
and appearance. The chat's existing suite also tests streaming, stop, rename,
delete, menus and dialogs.

## Native rendering differences

Matching tokens and layout does not imply that GPUI and Chromium produce
byte-identical screenshots. Their font rasterization, shadow kernels, native
editor placeholder opacity, Markdown layout and focus event routing differ.
The screenshot suite produces reviewable captures, not a pixel-diff test against
the shadcn website. There is no claim of zero pixel difference.

An opaque light editor surface is intentional: a transparent surface allows
GPUI's shadow fill to show through the editor interior. The dark editor uses the
equivalent composited Neutral surface. Popover cards remain opaque to avoid showing
the desktop through native windows. Dialog and toast placement anchors are zero-sized
with absolutely positioned content, so GPUIX does not paint its fallback #1a1a1a
surface behind backdrop transparency, gaps or rounded corners. GPUIX 0.7 has no text-decoration or rotating
SVG support; link hover underlines use a native rule, and accordion chevrons swap
between up/down paths without a rotation animation. Existing dialog focus-trap limitations still apply.
