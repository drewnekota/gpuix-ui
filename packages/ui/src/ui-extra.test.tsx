import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React, { useState } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { connectTest } from '@gpuix/react/automation'
import { createTestRoot, hasNativeTestRenderer } from '@gpuix/react/testing'
import { ThemeProvider, darkTheme, type Theme } from '@gpuix-ui/core'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SimplePagination,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Toaster,
  paginationRange,
  toast,
} from './index'

const describeNative = hasNativeTestRenderer ? describe : describe.skip
const painted = (renderer: { getPaintedText(): string[] }) => renderer.getPaintedText().join('\n')
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

function Gallery({ theme }: { theme: Theme }) {
  const [volume, setVolume] = useState(30)
  const [page, setPage] = useState(2)
  const [picked, setPicked] = useState('nothing')
  const [paletteOpen, setPaletteOpen] = useState(false)
  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: '100%', height: '100%', padding: 24, display: 'flex', flexDirection: 'row', gap: 24, backgroundColor: theme.colors.background }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 460 }}>
          <Menubar>
            <MenubarMenu value="file">
              <MenubarTrigger testId="menubar-file">File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem testId="menubar-new" shortcut="⌘N">
                  New file
                </MenubarItem>
                <MenubarItem>Open…</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu value="edit">
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Undo</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>gpuix-ui</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>
          <Accordion type="single" collapsible defaultValue="one">
            <AccordionItem value="one">
              <AccordionTrigger testId="acc-one">Is it native?</AccordionTrigger>
              <AccordionContent>Yes. Every element is a GPUI element painted with Metal.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger testId="acc-two">Is it styled?</AccordionTrigger>
              <AccordionContent>Yes, with the same theme tokens as shadcn/ui.</AccordionContent>
            </AccordionItem>
          </Accordion>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Slider testId="slider" value={volume} onValueChange={setVolume} width={240} />
            <Text size="sm" tone="muted">{`Volume ${volume}`}</Text>
          </div>
          <Table>
            <TableHeader>
              <TableRow interactive={false}>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell align="right">$250.00</TableCell>
              </TableRow>
              <TableRow selected>
                <TableCell>INV002</TableCell>
                <TableCell>Pending</TableCell>
                <TableCell align="right">$150.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <SimplePagination page={page} count={12} onPageChange={setPage} />
          <Text size="sm" tone="muted" testId="page-label">{`Page ${page}`}</Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 460 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
            <Sheet>
              <SheetTrigger asChild>
                <Button testId="sheet" variant="outline">
                  Open sheet
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>Make changes to your profile here.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Button testId="toast" variant="outline" onClick={() => toast.success({ id: 'saved', title: 'Saved', description: 'Your changes are safe.' })}>
              Show toast
            </Button>
            <Button testId="palette" variant="outline" onClick={() => setPaletteOpen(true)}>
              Palette
            </Button>
          </div>
          <ContextMenu>
            <ContextMenuTrigger testId="ctx-area" style={{ height: 80, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text size="sm" tone="muted">
                Right click here
              </Text>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem testId="ctx-copy" shortcut="⌘C" onSelect={() => setPicked('copy')}>
                Copy
              </ContextMenuItem>
              <ContextMenuItem>Paste</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <Text size="sm" tone="muted">{`Picked ${picked}`}</Text>
          <Command style={{ height: 240 }}>
            <CommandInput testId="command-input" />
            <CommandList>
              <CommandEmpty />
              <CommandGroup heading="Suggestions">
                <CommandItem value="calendar" onSelect={setPicked}>
                  Calendar
                </CommandItem>
                <CommandItem value="search emoji" onSelect={setPicked}>
                  Search emoji
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Settings">
                <CommandItem value="profile" shortcut="⌘P" onSelect={setPicked}>
                  Profile
                </CommandItem>
                <CommandItem value="billing" onSelect={setPicked}>
                  Billing
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
            <CommandInput testId="palette-input" />
            <CommandList>
              <CommandEmpty />
              <CommandItem value="new chat" onSelect={setPicked}>
                New chat
              </CommandItem>
              <CommandItem value="toggle theme" onSelect={setPicked}>
                Toggle theme
              </CommandItem>
            </CommandList>
          </CommandDialog>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

describe('paginationRange', () => {
  it('collapses long ranges with ellipses', () => {
    expect(paginationRange(2, 5)).toEqual([1, 2, 3, 4, 5])
    expect(paginationRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
    expect(paginationRange(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20])
    expect(paginationRange(19, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20])
  })
})

describeNative('ui gallery (extra)', () => {
  it('paints the new components', () => {
    const { render, renderer } = createTestRoot({ width: 1000, height: 760 })
    render(<Gallery theme={darkTheme} />)
    renderer.flush()
    const text = painted(renderer)
    for (const needle of ['File', 'Edit', 'Home', 'gpuix-ui', 'Is it native?', 'Every element', 'Volume 30', 'INV001', '$150.00', 'Page 2', 'Previous', 'Next', 'Open sheet', 'Right click here', 'Suggestions', 'Calendar', 'Billing']) {
      expect(text, needle).toContain(needle)
    }
    expect(text).not.toContain('same theme tokens')
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-extra-dark.png'))
  })

  it('accordion, slider, pagination, and menubar respond', async () => {
    const { render, renderer } = createTestRoot({ width: 1000, height: 760 })
    render(<Gallery theme={darkTheme} />)
    const app = await connectTest(renderer)

    await app.getByTestId('acc-two').click()
    expect(painted(renderer)).toContain('same theme tokens')
    expect(painted(renderer)).not.toContain('Every element')

    renderer.focusElement(renderer.findByTestId('slider')!.id)
    renderer.simulateKeystrokes('right')
    renderer.simulateKeystrokes('pageup')
    renderer.flush()
    expect(painted(renderer)).toContain('Volume 41')

    await app.getByTestId('pagination-next').click()
    expect(painted(renderer)).toContain('Page 3')
    await app.getByTestId('pagination-12').click()
    expect(painted(renderer)).toContain('Page 12')

    await app.getByTestId('menubar-file').click()
    await app.getByTestId('menubar-new').waitFor()
    expect(painted(renderer)).toContain('New file')
    renderer.simulateKeystrokes('escape')
    renderer.flush()
    expect(painted(renderer)).not.toContain('New file')
    await app.close()
  })

  it('sheet, toast, context menu, and command work', { timeout: 20000 }, async () => {
    const { render, renderer } = createTestRoot({ width: 1000, height: 760 })
    render(<Gallery theme={darkTheme} />)
    const app = await connectTest(renderer)

    await app.getByTestId('sheet').click()
    await app.getByTestId('sheet-close').waitFor()
    expect(painted(renderer)).toContain('Edit profile')
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-sheet-open.png'))
    await app.getByTestId('sheet-close').click()
    renderer.flush()
    expect(painted(renderer)).not.toContain('Edit profile')

    await app.getByTestId('toast').click()
    await app.getByTestId('toast-saved').waitFor()
    expect(painted(renderer)).toContain('Your changes are safe.')
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-toast.png'))
    await app.getByTestId('toast-close-saved').click()
    renderer.flush()
    expect(painted(renderer)).not.toContain('Your changes are safe.')

    const area = renderer.getElementBounds(renderer.findByTestId('ctx-area')!.id)!
    const cx = area[0] + area[2] / 2
    const cy = area[1] + area[3] / 2
    renderer.nativeSimulateMouseDown(cx, cy, 2)
    renderer.nativeSimulateMouseUp(cx, cy, 2)
    renderer.flush()
    await app.getByTestId('ctx-copy').waitFor()
    expect(painted(renderer)).toContain('Paste')
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-context-menu.png'))
    await app.getByTestId('ctx-copy').click()
    renderer.flush()
    expect(painted(renderer)).toContain('Picked copy')
    expect(painted(renderer)).not.toContain('Paste')

    await app.getByTestId('command-input').fill('bill')
    renderer.flush()
    renderer.focusElement(renderer.findByTestId('command-input')!.id)
    expect(painted(renderer)).toContain('Billing')
    expect(painted(renderer)).not.toContain('Calendar')
    expect(painted(renderer)).not.toContain('Suggestions')
    renderer.simulateKeystrokes('enter')
    renderer.flush()
    expect(painted(renderer)).toContain('Picked billing')

    await app.getByTestId('command-input').fill('zzz')
    renderer.flush()
    expect(painted(renderer)).toContain('No results found.')

    await app.getByTestId('palette').click()
    await app.getByTestId('palette-input').waitFor()
    expect(painted(renderer)).toContain('Toggle theme')
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-command-dialog.png'))
    await app.getByTestId('palette-input').fill('tog')
    renderer.simulateKeystrokes('enter')
    renderer.flush()
    expect(painted(renderer)).toContain('Picked toggle theme')
    expect(renderer.findByTestId('palette-input')).toBeUndefined()
    await app.close()
  })
})
