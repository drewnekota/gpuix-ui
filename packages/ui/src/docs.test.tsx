/**
 * Renders every component in its states and writes docs/components/<name>.png.
 * The README embeds these, so this doubles as a visual regression pass.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React, { type ReactNode } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { connectTest, type App } from '@gpuix/react/automation'
import { createTestRoot, hasNativeTestRenderer } from '@gpuix/react/testing'
import { ThemeProvider, darkTheme, lightTheme, withAlpha, type Theme } from '@gpuix-ui/core'
import * as UI from './index'
import { icons, type IconName } from './icons'

const describeNative = hasNativeTestRenderer ? describe : describe.skip
const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'docs', 'components')
const WIDTH = 720
beforeAll(() => fs.mkdirSync(DOCS, { recursive: true }))

type Renderer = ReturnType<typeof createTestRoot>['renderer']
type After = (renderer: Renderer, app: App) => Promise<void> | void
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Frame({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: '100%', height: '100%', backgroundColor: theme.colors.background }}>
        <div testId="frame" style={{ width: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>
      </div>
    </ThemeProvider>
  )
}

/** Renders once to measure, then again at the exact height, runs `after`, and screenshots. */
async function shoot(name: string, build: (t: Theme) => ReactNode, options: { height?: number; after?: After; theme?: Theme } = {}) {
  if (!options.theme) {
    await shoot(name, build, { ...options, theme: darkTheme })
    await shoot(`${name}-light`, build, { ...options, theme: lightTheme })
    return
  }
  const theme = options.theme
  let height = options.height
  if (height === undefined) {
    const probe = createTestRoot({ width: WIDTH, height: 1400 })
    probe.render(<Frame theme={theme}>{build(theme)}</Frame>)
    probe.renderer.flush()
    const bounds = probe.renderer.getElementBounds(probe.renderer.findByTestId('frame')!.id)!
    height = Math.ceil(bounds[3])
    probe.unmount()
  }
  const { render, renderer, unmount } = createTestRoot({ width: WIDTH, height })
  render(<Frame theme={theme}>{build(theme)}</Frame>)
  renderer.flush()
  await wait(30)
  renderer.flush()
  const app = await connectTest(renderer)
  await options.after?.(renderer, app)
  renderer.flush()
  renderer.captureScreenshot(path.join(DOCS, `${name}.png`))
  await app.close()
  unmount()
}

const center = (renderer: Renderer, testId: string): [number, number] => {
  const b = renderer.getElementBounds(renderer.findByTestId(testId)!.id)!
  return [b[0] + b[2] / 2, b[1] + b[3] / 2]
}
const hover = (renderer: Renderer, testId: string) => {
  const [x, y] = center(renderer, testId)
  renderer.nativeSimulateMouseMove(x, y)
  renderer.flush()
}
const focus = (renderer: Renderer, testId: string) => {
  renderer.focusElement(renderer.findByTestId(testId)!.id)
  renderer.flush()
}

function Row({ children, gap = 12, align = 'center' }: { children: ReactNode; gap?: number; align?: 'center' | 'flex-start' | 'flex-end' }) {
  return <div style={{ display: 'flex', flexDirection: 'row', alignItems: align, flexWrap: 'wrap', gap }}>{children}</div>
}
/** A row of <Case> blocks: labels line up along the bottom. */
function Cases({ children, gap = 24 }: { children: ReactNode; gap?: number }) {
  return (
    <Row gap={gap} align="flex-end">
      {children}
    </Row>
  )
}

function Case({ label, children, width }: { label: string; children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, width }}>
      {children}
      <UI.Text size="xs" tone="muted">
        {label}
      </UI.Text>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <UI.Text size="xs" tone="muted" weight="medium">
        {title.toUpperCase()}
      </UI.Text>
      {children}
    </div>
  )
}

const LOREM = 'GPUI paints every element on the GPU. There is no web view anywhere in the process.'

describeNative('component docs', () => {
  it('button', () =>
    shoot(
      'button',
      (t) => (
        <>
          <Section title="Variants">
            <Row>
              <UI.Button>Default</UI.Button>
              <UI.Button variant="secondary">Secondary</UI.Button>
              <UI.Button variant="outline">Outline</UI.Button>
              <UI.Button variant="ghost">Ghost</UI.Button>
              <UI.Button variant="destructive">Destructive</UI.Button>
              <UI.Button variant="link">Link</UI.Button>
            </Row>
          </Section>
          <Section title="Sizes">
            <Row>
              <UI.Button size="xs">Extra small</UI.Button>
              <UI.Button size="sm">Small</UI.Button>
              <UI.Button size="md">Medium</UI.Button>
              <UI.Button size="lg">Large</UI.Button>
              <UI.Button size="icon" variant="outline">
                <UI.Icon name="settings" size={16} color={t.colors.foreground} />
              </UI.Button>
              <UI.Button size="iconSm" variant="outline">
                <UI.Icon name="plus" size={14} color={t.colors.foreground} />
              </UI.Button>
            </Row>
          </Section>
          <Section title="States">
            <Cases gap={24}>
              <Case label="hover">
                <UI.Button testId="hover">Hovered</UI.Button>
              </Case>
              <Case label="pressed">
                <UI.Button testId="press" variant="outline">
                  Pressed
                </UI.Button>
              </Case>
              <Case label="disabled">
                <UI.Button disabled>Disabled</UI.Button>
              </Case>
              <Case label="with icon">
                <UI.Button variant="secondary">
                  <UI.Icon name="copy" size={14} color={t.colors.secondaryForeground} />
                  Copy
                </UI.Button>
              </Case>
            </Cases>
          </Section>
        </>
      ),
      {
        after: (renderer) => {
          hover(renderer, 'hover')
          const [x, y] = center(renderer, 'press')
          renderer.nativeSimulateMouseDown(x, y)
          renderer.flush()
        },
      },
    ))

  it('badge', () =>
    shoot('badge', () => (
      <Row>
        <UI.Badge>Default</UI.Badge>
        <UI.Badge variant="secondary">Secondary</UI.Badge>
        <UI.Badge variant="outline">Outline</UI.Badge>
        <UI.Badge variant="destructive">Destructive</UI.Badge>
        <UI.Badge variant="success">Success</UI.Badge>
      </Row>
    )))

  it('text', () =>
    shoot('text', () => (
      <>
        <Section title="Sizes">
          <Row>
            <UI.Text size="xs">xs</UI.Text>
            <UI.Text size="sm">sm</UI.Text>
            <UI.Text size="base">base</UI.Text>
            <UI.Text size="lg">lg</UI.Text>
            <UI.Text size="xl">xl</UI.Text>
            <UI.Text size="2xl">2xl</UI.Text>
          </Row>
        </Section>
        <Section title="Tones and weights">
          <Row>
            <UI.Text>default</UI.Text>
            <UI.Text tone="muted">muted</UI.Text>
            <UI.Text tone="destructive">destructive</UI.Text>
            <UI.Text tone="success">success</UI.Text>
            <UI.Text weight="medium">medium</UI.Text>
            <UI.Text weight="semibold">semibold</UI.Text>
            <UI.Text weight="bold">bold</UI.Text>
            <UI.Text mono>mono</UI.Text>
          </Row>
        </Section>
        <Section title="Truncate">
          <div style={{ width: 240 }}>
            <UI.Text truncate>{LOREM}</UI.Text>
          </div>
        </Section>
      </>
    )))

  it('input', () =>
    shoot(
      'input',
      (t) => (
        <Cases gap={16}>
          <Case label="placeholder" width={200}>
            <UI.Input placeholder="Email" />
          </Case>
          <Case label="with value" width={200}>
            <UI.Input value="ada@lovelace.dev" />
          </Case>
          <Case label="focus" width={200}>
            <UI.Input value="Typing…" style={{ borderColor: t.colors.ring, boxShadow: { offsetX: 0, offsetY: 0, blurRadius: 0, spreadRadius: 3, color: withAlpha(t.colors.ring, 0.5) } }} />
          </Case>
          <Case label="leading icon" width={200}>
            <UI.Input placeholder="Search" leading={<UI.Icon name="search" size={14} color={t.colors.mutedForeground} />} />
          </Case>
          <Case label="trailing" width={200}>
            <UI.Input placeholder="Command" trailing={<UI.Kbd>⌘K</UI.Kbd>} />
          </Case>
          <Case label="disabled" width={200}>
            <UI.Input disabled value="Read only" />
          </Case>
        </Cases>
      ),
    ))

  it('textarea', () =>
    shoot(
      'textarea',
      (t) => (
        <Cases gap={16}>
          <Case label="placeholder" width={320}>
            <UI.Textarea placeholder="Write a message…" />
          </Case>
          <Case label="focus, with value" width={320}>
            <UI.Textarea value={LOREM} style={{ borderColor: t.colors.ring, boxShadow: { offsetX: 0, offsetY: 0, blurRadius: 0, spreadRadius: 3, color: withAlpha(t.colors.ring, 0.5) } }} />
          </Case>
        </Cases>
      ),
    ))

  it('checkbox', () =>
    shoot('checkbox', () => (
      <Cases gap={24}>
        <Case label="unchecked">
          <Row gap={8}>
            <UI.Checkbox />
            <UI.Label>Accept terms</UI.Label>
          </Row>
        </Case>
        <Case label="checked">
          <Row gap={8}>
            <UI.Checkbox defaultChecked />
            <UI.Label>Accept terms</UI.Label>
          </Row>
        </Case>
        <Case label="indeterminate">
          <Row gap={8}>
            <UI.Checkbox checked="indeterminate" />
            <UI.Label>Select all</UI.Label>
          </Row>
        </Case>
        <Case label="disabled">
          <Row gap={8}>
            <UI.Checkbox disabled defaultChecked />
            <UI.Label>Locked</UI.Label>
          </Row>
        </Case>
      </Cases>
    )))

  it('switch', () =>
    shoot('switch', () => (
      <Cases gap={24}>
        <Case label="off">
          <UI.Switch />
        </Case>
        <Case label="on">
          <UI.Switch defaultChecked />
        </Case>
        <Case label="small">
          <UI.Switch size="sm" defaultChecked />
        </Case>
        <Case label="disabled">
          <UI.Switch disabled defaultChecked />
        </Case>
      </Cases>
    )))

  it('radio-group', () =>
    shoot('radio-group', () => (
      <UI.RadioGroup defaultValue="normal" style={{ gap: 10 }}>
        <Row gap={8}>
          <UI.RadioGroupItem value="slow" />
          <UI.Label>Slow</UI.Label>
        </Row>
        <Row gap={8}>
          <UI.RadioGroupItem value="normal" />
          <UI.Label>Normal (selected)</UI.Label>
        </Row>
        <Row gap={8}>
          <UI.RadioGroupItem value="fast" disabled />
          <UI.Label>Fast (disabled)</UI.Label>
        </Row>
      </UI.RadioGroup>
    )))

  it('toggle', () =>
    shoot('toggle', (t) => (
      <Cases gap={24}>
        <Case label="off">
          <UI.Toggle>Bold</UI.Toggle>
        </Case>
        <Case label="pressed">
          <UI.Toggle defaultPressed>Bold</UI.Toggle>
        </Case>
        <Case label="outline">
          <UI.Toggle variant="outline">Italic</UI.Toggle>
        </Case>
        <Case label="small, with icon">
          <UI.Toggle size="sm" defaultPressed>
            <UI.Icon name="settings" size={13} color={t.colors.accentForeground} />
            Think
          </UI.Toggle>
        </Case>
        <Case label="disabled">
          <UI.Toggle disabled>Bold</UI.Toggle>
        </Case>
      </Cases>
    )))

  it('label-kbd-separator', () =>
    shoot('label-kbd-separator', () => (
      <>
        <Section title="Label">
          <UI.Label>Display name</UI.Label>
        </Section>
        <Section title="Kbd">
          <Row gap={6}>
            <UI.Kbd>⌘</UI.Kbd>
            <UI.Kbd>K</UI.Kbd>
            <UI.Kbd>Enter</UI.Kbd>
            <UI.Kbd>Esc</UI.Kbd>
          </Row>
        </Section>
        <Section title="Separator">
          <UI.Separator />
          <Row gap={12}>
            <UI.Text size="sm">Left</UI.Text>
            <UI.Separator orientation="vertical" style={{ height: 16 }} />
            <UI.Text size="sm">Right</UI.Text>
          </Row>
        </Section>
      </>
    )))

  it('avatar', () =>
    shoot('avatar', (t) => (
      <Cases gap={16}>
        <Case label="24">
          <UI.Avatar fallback="You" size={24} />
        </Case>
        <Case label="32">
          <UI.Avatar fallback="Ada Lovelace" />
        </Case>
        <Case label="48">
          <UI.Avatar fallback="Grace Hopper" size={48} />
        </Case>
        <Case label="custom colour">
          <UI.Avatar fallback="AI" size={40} color={t.colors.primary} />
        </Case>
      </Cases>
    )))

  it('skeleton-progress-spinner', () =>
    shoot('skeleton-progress-spinner', (t) => (
      <>
        <Section title="Skeleton">
          <Row gap={12}>
            <UI.Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <UI.Skeleton style={{ width: 240, height: 12 }} />
              <UI.Skeleton style={{ width: 180, height: 12 }} />
            </div>
          </Row>
        </Section>
        <Section title="Progress">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
            <UI.Progress value={0} />
            <UI.Progress value={40} />
            <UI.Progress value={100} />
            <UI.Progress value={65} color={t.colors.success} />
          </div>
        </Section>
        <Section title="Spinner">
          <Row gap={24}>
            <UI.Spinner size={4} />
            <UI.Spinner />
            <UI.Spinner size={8} color={t.colors.primary} />
          </Row>
        </Section>
      </>
    )))

  it('alert', () =>
    shoot('alert', () => (
      <>
        <UI.Alert>
          <UI.AlertTitle>Heads up</UI.AlertTitle>
          <UI.AlertDescription>You can add components to your app using the CLI.</UI.AlertDescription>
        </UI.Alert>
        <UI.Alert variant="warning">
          <UI.AlertTitle>Unsaved changes</UI.AlertTitle>
          <UI.AlertDescription>Your session will expire in five minutes.</UI.AlertDescription>
        </UI.Alert>
        <UI.Alert variant="destructive">
          <UI.AlertTitle>Error</UI.AlertTitle>
          <UI.AlertDescription>The agent could not reach the API.</UI.AlertDescription>
        </UI.Alert>
      </>
    )))

  it('card', () =>
    shoot('card', () => (
      <UI.Card style={{ width: 380 }}>
        <UI.CardHeader>
          <UI.CardTitle>Create project</UI.CardTitle>
          <UI.CardDescription>Deploy your new project in one click.</UI.CardDescription>
        </UI.CardHeader>
        <UI.CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <UI.Label>Name</UI.Label>
            <UI.Input placeholder="Name of your project" />
          </div>
        </UI.CardContent>
        <UI.CardFooter style={{ justifyContent: 'space-between' }}>
          <UI.Button variant="outline">Cancel</UI.Button>
          <UI.Button>Deploy</UI.Button>
        </UI.CardFooter>
      </UI.Card>
    )))

  it('tabs', () =>
    shoot('tabs', () => (
      <UI.Tabs defaultValue="account" style={{ width: 360 }}>
        <UI.TabsList>
          <UI.TabsTrigger value="account">Account</UI.TabsTrigger>
          <UI.TabsTrigger value="password">Password</UI.TabsTrigger>
          <UI.TabsTrigger value="team" disabled>
            Team
          </UI.TabsTrigger>
        </UI.TabsList>
        <UI.TabsContent value="account">
          <UI.Text size="sm" tone="muted">
            Make changes to your account here.
          </UI.Text>
        </UI.TabsContent>
        <UI.TabsContent value="password">
          <UI.Text size="sm" tone="muted">
            Change your password here.
          </UI.Text>
        </UI.TabsContent>
      </UI.Tabs>
    )))

  it('accordion', () =>
    shoot('accordion', () => (
      <UI.Accordion type="single" collapsible defaultValue="one" style={{ width: 480 }}>
        <UI.AccordionItem value="one">
          <UI.AccordionTrigger>Is it native?</UI.AccordionTrigger>
          <UI.AccordionContent>Yes. Every element is a GPUI element painted with Metal, DirectX, or Vulkan.</UI.AccordionContent>
        </UI.AccordionItem>
        <UI.AccordionItem value="two">
          <UI.AccordionTrigger>Is it styled?</UI.AccordionTrigger>
          <UI.AccordionContent>Yes, with the same theme tokens as shadcn/ui.</UI.AccordionContent>
        </UI.AccordionItem>
        <UI.AccordionItem value="three" disabled>
          <UI.AccordionTrigger>Is it disabled?</UI.AccordionTrigger>
          <UI.AccordionContent>Never shown.</UI.AccordionContent>
        </UI.AccordionItem>
      </UI.Accordion>
    )))

  it('collapsible', () =>
    shoot('collapsible', (t) => (
      <Cases gap={32}>
        <Case label="closed">
          <UI.Collapsible>
            <UI.CollapsibleTrigger style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <UI.Icon name="chevronRight" size={14} color={t.colors.mutedForeground} />
              <UI.Text size="sm">3 hidden files</UI.Text>
            </UI.CollapsibleTrigger>
            <UI.CollapsibleContent>
              <UI.Text size="sm" tone="muted">
                .env, .gitignore, .npmrc
              </UI.Text>
            </UI.CollapsibleContent>
          </UI.Collapsible>
        </Case>
        <Case label="open">
          <UI.Collapsible defaultOpen>
            <UI.CollapsibleTrigger style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <UI.Icon name="chevronDown" size={14} color={t.colors.mutedForeground} />
              <UI.Text size="sm">3 hidden files</UI.Text>
            </UI.CollapsibleTrigger>
            <UI.CollapsibleContent style={{ paddingLeft: 20, paddingTop: 6 }}>
              <UI.Text size="sm" tone="muted">
                .env, .gitignore, .npmrc
              </UI.Text>
            </UI.CollapsibleContent>
          </UI.Collapsible>
        </Case>
      </Cases>
    )))

  it('scroll-area', () =>
    shoot('scroll-area', (t) => (
      <UI.ScrollArea style={{ height: 140, width: 280, borderWidth: 1, borderColor: t.colors.border, borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <UI.Text key={i} size="sm">{`v1.2.${i}`}</UI.Text>
          ))}
        </div>
      </UI.ScrollArea>
    )))

  it('slider', () =>
    shoot('slider', () => (
      <Cases gap={24}>
        <Case label="0">
          <UI.Slider defaultValue={0} width={140} />
        </Case>
        <Case label="30">
          <UI.Slider defaultValue={30} width={140} />
        </Case>
        <Case label="100">
          <UI.Slider defaultValue={100} width={140} />
        </Case>
        <Case label="disabled">
          <UI.Slider defaultValue={60} width={140} disabled />
        </Case>
      </Cases>
    )))

  it('table', () =>
    shoot(
      'table',
      () => (
        <UI.Table>
          <UI.TableHeader>
            <UI.TableRow interactive={false}>
              <UI.TableHead width={120}>Invoice</UI.TableHead>
              <UI.TableHead>Status</UI.TableHead>
              <UI.TableHead>Method</UI.TableHead>
              <UI.TableHead align="right">Amount</UI.TableHead>
            </UI.TableRow>
          </UI.TableHeader>
          <UI.TableBody>
            <UI.TableRow>
              <UI.TableCell width={120}>INV001</UI.TableCell>
              <UI.TableCell>Paid</UI.TableCell>
              <UI.TableCell>Credit card</UI.TableCell>
              <UI.TableCell align="right">$250.00</UI.TableCell>
            </UI.TableRow>
            <UI.TableRow testId="hover">
              <UI.TableCell width={120}>INV002</UI.TableCell>
              <UI.TableCell>Pending (hover)</UI.TableCell>
              <UI.TableCell>PayPal</UI.TableCell>
              <UI.TableCell align="right">$150.00</UI.TableCell>
            </UI.TableRow>
            <UI.TableRow selected>
              <UI.TableCell width={120}>INV003</UI.TableCell>
              <UI.TableCell>Unpaid (selected)</UI.TableCell>
              <UI.TableCell>Bank transfer</UI.TableCell>
              <UI.TableCell align="right">$350.00</UI.TableCell>
            </UI.TableRow>
          </UI.TableBody>
          <UI.TableCaption>A list of your recent invoices.</UI.TableCaption>
        </UI.Table>
      ),
      { after: (renderer) => hover(renderer, 'hover') },
    ))

  it('breadcrumb', () =>
    shoot('breadcrumb', () => (
      <UI.Breadcrumb>
        <UI.BreadcrumbItem>
          <UI.BreadcrumbLink>Home</UI.BreadcrumbLink>
        </UI.BreadcrumbItem>
        <UI.BreadcrumbSeparator />
        <UI.BreadcrumbItem>
          <UI.BreadcrumbEllipsis />
        </UI.BreadcrumbItem>
        <UI.BreadcrumbSeparator />
        <UI.BreadcrumbItem>
          <UI.BreadcrumbLink>Components</UI.BreadcrumbLink>
        </UI.BreadcrumbItem>
        <UI.BreadcrumbSeparator />
        <UI.BreadcrumbItem>
          <UI.BreadcrumbPage>Breadcrumb</UI.BreadcrumbPage>
        </UI.BreadcrumbItem>
      </UI.Breadcrumb>
    )))

  it('pagination', () =>
    shoot('pagination', () => (
      <>
        <UI.SimplePagination page={1} count={20} onPageChange={() => {}} />
        <UI.SimplePagination page={7} count={20} onPageChange={() => {}} />
        <UI.SimplePagination page={20} count={20} onPageChange={() => {}} />
      </>
    )))

  it('select', () =>
    shoot(
      'select',
      () => (
        <Cases gap={16}>
          <Case label="placeholder">
            <UI.Select>
              <UI.SelectTrigger style={{ width: 180 }}>
                <UI.SelectValue placeholder="Pick a model" />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectItem value="a">Alpha</UI.SelectItem>
              </UI.SelectContent>
            </UI.Select>
          </Case>
          <Case label="ghost, small">
            <UI.Select defaultValue="opus">
              <UI.SelectTrigger variant="ghost" size="sm">
                <UI.SelectValue size="sm" />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectItem value="opus">Claude Opus 5</UI.SelectItem>
              </UI.SelectContent>
            </UI.Select>
          </Case>
          <Case label="open">
            <UI.Select defaultValue="opus">
              <UI.SelectTrigger testId="open" style={{ width: 220 }}>
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectGroup>
                  <UI.SelectItem value="opus" description="Most capable">
                    Claude Opus 5
                  </UI.SelectItem>
                  <UI.SelectItem value="sonnet" description="Fast and smart">
                    Claude Sonnet 5
                  </UI.SelectItem>
                  <UI.SelectItem value="haiku" disabled>
                    Claude Haiku 4.5
                  </UI.SelectItem>
                </UI.SelectGroup>
              </UI.SelectContent>
            </UI.Select>
          </Case>
        </Cases>
      ),
      { height: 260, after: async (_, app) => app.getByTestId('open').click() },
    ))

  it('dropdown-menu', () =>
    shoot(
      'dropdown-menu',
      () => (
        <UI.DropdownMenu>
          <UI.DropdownMenuTrigger asChild>
            <UI.Button testId="open" variant="outline">
              Open menu
            </UI.Button>
          </UI.DropdownMenuTrigger>
          <UI.DropdownMenuContent align="start">
            <UI.DropdownMenuLabel>My account</UI.DropdownMenuLabel>
            <UI.DropdownMenuSeparator />
            <UI.DropdownMenuItem shortcut="⌘P">Profile</UI.DropdownMenuItem>
            <UI.DropdownMenuItem testId="hover" shortcut="⌘B">
              Billing (highlighted)
            </UI.DropdownMenuItem>
            <UI.DropdownMenuItem disabled>Team (disabled)</UI.DropdownMenuItem>
            <UI.DropdownMenuSeparator />
            <UI.DropdownMenuCheckboxItem checked>Show status bar</UI.DropdownMenuCheckboxItem>
            <UI.DropdownMenuCheckboxItem checked={false}>Show panel</UI.DropdownMenuCheckboxItem>
            <UI.DropdownMenuSeparator />
            <UI.DropdownMenuRadioGroup value="bottom">
              <UI.DropdownMenuRadioItem value="top">Top</UI.DropdownMenuRadioItem>
              <UI.DropdownMenuRadioItem value="bottom">Bottom</UI.DropdownMenuRadioItem>
            </UI.DropdownMenuRadioGroup>
            <UI.DropdownMenuSeparator />
            <UI.DropdownMenuItem variant="destructive">Delete</UI.DropdownMenuItem>
          </UI.DropdownMenuContent>
        </UI.DropdownMenu>
      ),
      {
        height: 400,
        after: async (renderer, app) => {
          await app.getByTestId('open').click()
          await app.getByTestId('hover').waitFor()
          hover(renderer, 'hover')
        },
      },
    ))

  it('context-menu', () =>
    shoot(
      'context-menu',
      (t) => (
        <UI.ContextMenu>
          <UI.ContextMenuTrigger testId="area" style={{ width: 320, height: 120, borderWidth: 1, borderColor: t.colors.border, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UI.Text size="sm" tone="muted">
              Right click here
            </UI.Text>
          </UI.ContextMenuTrigger>
          <UI.ContextMenuContent>
            <UI.ContextMenuItem shortcut="⌘C">Copy</UI.ContextMenuItem>
            <UI.ContextMenuItem shortcut="⌘V">Paste</UI.ContextMenuItem>
            <UI.ContextMenuSeparator />
            <UI.ContextMenuItem variant="destructive">Delete</UI.ContextMenuItem>
          </UI.ContextMenuContent>
        </UI.ContextMenu>
      ),
      {
        height: 300,
        after: async (renderer, app) => {
          const [x, y] = center(renderer, 'area')
          renderer.nativeSimulateMouseDown(x, y, 2)
          renderer.nativeSimulateMouseUp(x, y, 2)
          await app.getByTestId('area').waitFor()
        },
      },
    ))

  it('menubar', () =>
    shoot(
      'menubar',
      () => (
        <UI.Menubar>
          <UI.MenubarMenu value="file">
            <UI.MenubarTrigger testId="open">File</UI.MenubarTrigger>
            <UI.MenubarContent>
              <UI.MenubarItem shortcut="⌘N">New window</UI.MenubarItem>
              <UI.MenubarItem shortcut="⌘O">Open…</UI.MenubarItem>
              <UI.MenubarSeparator />
              <UI.MenubarItem>Share</UI.MenubarItem>
            </UI.MenubarContent>
          </UI.MenubarMenu>
          <UI.MenubarMenu value="edit">
            <UI.MenubarTrigger>Edit</UI.MenubarTrigger>
            <UI.MenubarContent>
              <UI.MenubarItem>Undo</UI.MenubarItem>
            </UI.MenubarContent>
          </UI.MenubarMenu>
          <UI.MenubarMenu value="view">
            <UI.MenubarTrigger>View</UI.MenubarTrigger>
            <UI.MenubarContent>
              <UI.MenubarItem>Zoom</UI.MenubarItem>
            </UI.MenubarContent>
          </UI.MenubarMenu>
        </UI.Menubar>
      ),
      { height: 220, after: async (_, app) => app.getByTestId('open').click() },
    ))

  it('popover', () =>
    shoot(
      'popover',
      () => (
        <UI.Popover>
          <UI.PopoverTrigger asChild>
            <UI.Button testId="open" variant="outline">
              Open popover
            </UI.Button>
          </UI.PopoverTrigger>
          <UI.PopoverContent style={{ width: 260, gap: 8 }}>
            <UI.Text weight="medium">Dimensions</UI.Text>
            <UI.Text size="sm" tone="muted">
              Set the dimensions for the layer.
            </UI.Text>
            <Row gap={8}>
              <UI.Label style={{ width: 60 }}>Width</UI.Label>
              <UI.Input value="100%" style={{ flexGrow: 1 }} />
            </Row>
          </UI.PopoverContent>
        </UI.Popover>
      ),
      { height: 240, after: async (_, app) => app.getByTestId('open').click() },
    ))

  it('tooltip', () =>
    shoot(
      'tooltip',
      () => (
        <div style={{ paddingTop: 36 }}>
          <UI.Tooltip>
            <UI.TooltipTrigger asChild>
              <UI.Button testId="trigger" variant="outline">
                Hover me
              </UI.Button>
            </UI.TooltipTrigger>
            <UI.TooltipContent>Add to library</UI.TooltipContent>
          </UI.Tooltip>
        </div>
      ),
      {
        after: async (renderer) => {
          hover(renderer, 'trigger')
          await wait(900)
          renderer.flush()
        },
      },
    ))

  it('dialog', () =>
    shoot(
      'dialog',
      () => (
        <UI.Dialog defaultOpen>
          <UI.DialogContent style={{ width: 400 }}>
            <UI.DialogHeader>
              <UI.DialogTitle>Rename conversation</UI.DialogTitle>
              <UI.DialogDescription>Pick a title that helps you find it later.</UI.DialogDescription>
            </UI.DialogHeader>
            <UI.Input value="Planning session" />
            <UI.DialogFooter>
              <UI.DialogClose asChild>
                <UI.Button variant="outline">Cancel</UI.Button>
              </UI.DialogClose>
              <UI.Button>Save</UI.Button>
            </UI.DialogFooter>
          </UI.DialogContent>
        </UI.Dialog>
      ),
      { height: 320 },
    ))

  it('alert-dialog', () =>
    shoot(
      'alert-dialog',
      () => (
        <UI.AlertDialog defaultOpen>
          <UI.AlertDialogContent style={{ width: 400 }}>
            <UI.AlertDialogHeader>
              <UI.AlertDialogTitle>Delete conversation?</UI.AlertDialogTitle>
              <UI.AlertDialogDescription>This cannot be undone. The messages will be removed from this device.</UI.AlertDialogDescription>
            </UI.AlertDialogHeader>
            <UI.AlertDialogFooter>
              <UI.AlertDialogCancel>Cancel</UI.AlertDialogCancel>
              <UI.AlertDialogAction variant="destructive">Delete</UI.AlertDialogAction>
            </UI.AlertDialogFooter>
          </UI.AlertDialogContent>
        </UI.AlertDialog>
      ),
      { height: 300 },
    ))

  it('sheet', () =>
    shoot(
      'sheet',
      () => (
        <UI.Sheet defaultOpen>
          <UI.SheetContent size={300}>
            <UI.SheetHeader>
              <UI.SheetTitle>Edit profile</UI.SheetTitle>
              <UI.SheetDescription>Make changes to your profile here.</UI.SheetDescription>
            </UI.SheetHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <UI.Label>Name</UI.Label>
              <UI.Input value="Ada Lovelace" />
            </div>
            <UI.SheetFooter>
              <UI.Button>Save changes</UI.Button>
            </UI.SheetFooter>
          </UI.SheetContent>
        </UI.Sheet>
      ),
      { height: 340 },
    ))

  it('command', () =>
    shoot(
      'command',
      () => (
        <UI.Command style={{ width: 440 }}>
          <UI.CommandInput testId="input" />
          <UI.CommandList>
            <UI.CommandEmpty />
            <UI.CommandGroup heading="Suggestions">
              <UI.CommandItem value="calendar">Calendar</UI.CommandItem>
              <UI.CommandItem value="search emoji">Search emoji</UI.CommandItem>
              <UI.CommandItem value="calculator" disabled>
                Calculator (disabled)
              </UI.CommandItem>
            </UI.CommandGroup>
            <UI.CommandSeparator />
            <UI.CommandGroup heading="Settings">
              <UI.CommandItem value="profile" shortcut="⌘P">
                Profile
              </UI.CommandItem>
              <UI.CommandItem value="billing" shortcut="⌘B">
                Billing
              </UI.CommandItem>
            </UI.CommandGroup>
          </UI.CommandList>
        </UI.Command>
      ),
      { after: (renderer) => focus(renderer, 'input') },
    ))

  it('command-dialog', () =>
    shoot(
      'command-dialog',
      () => (
        <UI.CommandDialog defaultOpen width={440} topOffset={32}>
          <UI.CommandInput testId="input" />
          <UI.CommandList>
            <UI.CommandEmpty />
            <UI.CommandItem value="new chat">New chat</UI.CommandItem>
            <UI.CommandItem value="toggle theme">Toggle theme</UI.CommandItem>
            <UI.CommandItem value="open settings">Open settings</UI.CommandItem>
          </UI.CommandList>
        </UI.CommandDialog>
      ),
      {
        height: 260,
        after: async (_, app) => {
          await app.getByTestId('input').fill('t')
        },
      },
    ))

  it('toast', () =>
    shoot(
      'toast',
      () => <UI.Toaster position="top-left" offset={24} width={WIDTH - 48} newestOnTop={false} />,
      {
        height: 380,
        after: async (renderer) => {
          UI.toast({ id: 'a', title: 'Event created', description: 'Sunday, 7 September at 9:00 AM', action: { label: 'Undo', onClick: () => {} } })
          UI.toast.success({ id: 'b', title: 'Saved', description: 'Your changes are safe.' })
          UI.toast.warning({ id: 'c', title: 'Low on credits', description: 'Top up to keep the agent running.' })
          UI.toast.error({ id: 'd', title: 'Request failed', description: 'The API returned 429. Retrying in 20 s.' })
          await wait(50)
          renderer.flush()
        },
      },
    ).finally(() => UI.dismissToast()))

  it('icons', () =>
    shoot('icons', (t) => (
      <Row gap={16}>
        {(Object.keys(icons) as IconName[]).map((name) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 90 }}>
            <UI.Icon name={name} size={20} color={t.colors.foreground} />
            <UI.Text size="xs" tone="muted">
              {name}
            </UI.Text>
          </div>
        ))}
      </Row>
    )))

  it('themes', async () => {
    const build = (t: Theme) => (
      <>
        <Row>
          <UI.Button>Default</UI.Button>
          <UI.Button variant="secondary">Secondary</UI.Button>
          <UI.Button variant="outline">Outline</UI.Button>
          <UI.Badge variant="success">OK</UI.Badge>
          <UI.Switch defaultChecked />
          <UI.Checkbox defaultChecked />
        </Row>
        <Row gap={16} align="flex-start">
          <UI.Input placeholder="Search" leading={<UI.Icon name="search" size={14} color={t.colors.mutedForeground} />} style={{ width: 220 }} />
          <UI.Card style={{ width: 300 }}>
            <UI.CardHeader>
              <UI.CardTitle>Card title</UI.CardTitle>
              <UI.CardDescription>Card description text.</UI.CardDescription>
            </UI.CardHeader>
            <UI.CardContent>
              <UI.Alert>
                <UI.AlertTitle>Heads up</UI.AlertTitle>
                <UI.AlertDescription>An alert inside a card.</UI.AlertDescription>
              </UI.Alert>
            </UI.CardContent>
          </UI.Card>
        </Row>
      </>
    )
    await shoot('theme-dark', build, { theme: darkTheme })
    await shoot('theme-light', build, { theme: lightTheme })
    expect(fs.existsSync(path.join(DOCS, 'theme-light.png'))).toBe(true)
  })
})
