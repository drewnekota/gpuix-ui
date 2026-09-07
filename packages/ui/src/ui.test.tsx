import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { connectTest } from '@gpuix/react/automation'
import { createTestRoot, hasNativeTestRenderer } from '@gpuix/react/testing'
import { ThemeProvider, darkTheme, lightTheme, type Theme } from '@gpuix-ui/core'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Kbd,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  Toggle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './index'

const describeNative = hasNativeTestRenderer ? describe : describe.skip
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

function Gallery({ theme }: { theme: Theme }) {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: '100%', height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: theme.colors.background }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Button testId="btn-default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="success">OK</Badge>
          <Kbd>⌘K</Kbd>
          <Avatar fallback="AB" />
          <Switch defaultChecked testId="switch" />
          <Checkbox defaultChecked testId="checkbox" />
          <Toggle defaultPressed>Toggle</Toggle>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 280 }}>
            <Label>Name</Label>
            <Input placeholder="Type here" testId="input" />
            <Textarea placeholder="Longer text" />
            <Progress value={40} />
            <Skeleton />
            <Separator />
            <RadioGroup defaultValue="a">
              <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <RadioGroupItem value="a" />
                <Text size="sm">Option A</Text>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <RadioGroupItem value="b" />
                <Text size="sm">Option B</Text>
              </div>
            </RadioGroup>
          </div>
          <Card style={{ width: 320 }}>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Card description text.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="one">
                <TabsList>
                  <TabsTrigger value="one" testId="tab-one">
                    One
                  </TabsTrigger>
                  <TabsTrigger value="two" testId="tab-two">
                    Two
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="one">
                  <Text size="sm">Tab one content</Text>
                </TabsContent>
                <TabsContent value="two">
                  <Text size="sm">Tab two content</Text>
                </TabsContent>
              </Tabs>
              <Alert>
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>An alert inside a card.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Select defaultValue="b">
              <SelectTrigger testId="select" style={{ width: 200 }}>
                <SelectValue placeholder="Pick" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Alpha</SelectItem>
                <SelectItem value="b">Beta</SelectItem>
                <SelectItem value="c" disabled>
                  Gamma
                </SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" testId="menu">
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem testId="menu-item" shortcut="⌘R">
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog>
              <DialogTrigger asChild>
                <Button testId="dialog">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog title</DialogTitle>
                  <DialogDescription>Dialog description.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

describeNative('ui gallery', () => {
  it('paints every component in the dark theme', async () => {
    const { render, renderer } = createTestRoot({ width: 1100, height: 700 })
    render(<Gallery theme={darkTheme} />)
    renderer.flush()
    const painted = renderer.getPaintedText()
    for (const needle of ['Default', 'Secondary', 'Outline', 'Ghost', 'Destructive', 'Badge', 'Card title', 'Tab one content', 'Heads up', 'Beta', 'Menu', 'Open dialog', 'Option A', '⌘K']) {
      expect(painted, needle).toContain(needle)
    }
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-dark.png'))
  })

  it('paints the light theme', () => {
    const { render, renderer } = createTestRoot({ width: 1100, height: 700 })
    render(<Gallery theme={lightTheme} />)
    renderer.flush()
    expect(renderer.getPaintedText()).toContain('Card title')
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-light.png'))
  })

  it('opens the select, the menu, and the dialog', async () => {
    const { render, renderer } = createTestRoot({ width: 1100, height: 700 })
    render(<Gallery theme={darkTheme} />)
    const app = await connectTest(renderer)
    await app.getByTestId('select').click()
    expect(renderer.getPaintedText()).toContain('Gamma')
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-select-open.png'))
    renderer.simulateKeystrokes('escape')
    renderer.flush()
    expect(renderer.getPaintedText()).not.toContain('Gamma')

    await app.getByTestId('menu').click()
    await app.getByTestId('menu-item').waitFor()
    expect(renderer.getPaintedText()).toContain('⌘R')
    renderer.simulateKeystrokes('escape')
    renderer.flush()

    await app.getByTestId('dialog').click()
    await app.getByTestId('dialog-close').waitFor()
    expect(renderer.getPaintedText()).toContain('Dialog title')
    renderer.captureScreenshot(path.join(SHOTS, 'gallery-dialog-open.png'))
    await app.getByTestId('dialog-close').click()
    renderer.flush()
    expect(renderer.getPaintedText()).not.toContain('Dialog title')

    await app.getByTestId('tab-two').click()
    expect(renderer.getPaintedText()).toContain('Tab two content')
    await app.close()
  })
})
