/**
 * An agent chat app built entirely from gpuix-ui components, rendered on the
 * GPU by GPUIX. This is the dogfood: every menu, dialog, picker, toggle, and
 * card in the window comes from the component library.
 *
 *   bun --hot app.tsx                 # dark, mock agent
 *   ANTHROPIC_API_KEY=... bun app.tsx # pick a Claude model in the composer
 *   GPUIX_BACKGROUND=1 bun app.tsx    # open behind the active app (agents)
 */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, render, useGpuix, useWindowInsets, type PublicInstance } from '@gpuix/react'
import { ThemeProvider, darkTheme, lightTheme, toGpuixTheme, useTheme, type Theme } from '@gpuix-ui/core'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Input,
  Kbd,
  Label,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Separator,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@gpuix-ui/react'
import { appIcons, type AppIconName } from './icons'
import { hasClaudeCredentials, mockAgent, pickAgent, type Agent, type AgentEvent } from './agent'

// ── Data ───────────────────────────────────────────────────────────────────

interface ToolCall {
  id: string
  name: string
  input: string
  output?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  tools?: ToolCall[]
  streaming?: boolean
  error?: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

const MODELS = [
  { id: 'mock', label: 'Demo agent', group: 'Local', description: 'Canned answers, no network' },
  { id: 'claude-opus-5', label: 'Claude Opus 5', group: 'Anthropic', description: 'Needs ANTHROPIC_API_KEY' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5', group: 'Anthropic', description: 'Needs ANTHROPIC_API_KEY' },
]

const SUGGESTIONS = [
  { title: 'What is GPUIX?', body: 'Explain how React reaches the GPU without a web view.' },
  { title: 'Show me a code example', body: 'A button built with the sv variant helper.' },
  { title: 'Say hello', body: 'A short greeting to check streaming works.' },
]

const SIDEBAR_WIDTH = 260
const CONTENT_MAX_WIDTH = 720
const HEADER_HEIGHT = 48
const IS_MAC = typeof process !== 'undefined' && process.platform === 'darwin'
const TRAFFIC_LIGHT_CLEARANCE = IS_MAC ? 78 : 8

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}-${Date.now().toString(36)}`

function newConversation(): Conversation {
  return { id: nextId('c'), title: 'New chat', messages: [], createdAt: Date.now() }
}

function titleFrom(text: string): string {
  const line = text.trim().split('\n')[0] ?? ''
  return line.length > 42 ? `${line.slice(0, 42)}…` : line || 'New chat'
}

function copyToClipboard(text: string) {
  if (typeof Bun === 'undefined') return
  const command = process.platform === 'darwin' ? ['pbcopy'] : process.platform === 'win32' ? ['clip'] : ['xclip', '-selection', 'clipboard']
  try {
    const proc = Bun.spawn(command, { stdin: 'pipe' })
    proc.stdin.write(text)
    proc.stdin.end()
  } catch {
    // No clipboard tool on this machine. Nothing else to do.
  }
}

function AppIcon({ name, size = 16, color }: { name: AppIconName; size?: number; color: string }) {
  return <Icon source={appIcons[name]} size={size} color={color} />
}

// ── Sidebar ────────────────────────────────────────────────────────────────

function ConversationRow({
  conversation,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: Conversation
  active: boolean
  onSelect: () => void
  onRename: () => void
  onDelete: () => void
}) {
  const t = useTheme()
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const showMenu = hovered || menuOpen
  return (
    <div
      testId={`conversation-${conversation.id}`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 34,
        paddingLeft: 10,
        paddingRight: 4,
        borderRadius: t.radius.md,
        cursor: 'pointer',
        backgroundColor: active ? t.colors.overlayStrong : '#00000000',
        hover: { backgroundColor: active ? t.colors.overlayStrong : t.colors.overlay },
      }}
    >
      <Text size="sm" truncate style={{ flexGrow: 1, color: active ? t.colors.foreground : t.colors.sidebarForeground }}>
        {conversation.title}
      </Text>
      {showMenu ? (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconXs" testId={`conversation-menu-${conversation.id}`} onClick={(event) => void event}>
              <AppIcon name="ellipsis" size={14} color={t.colors.mutedForeground} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem onSelect={onRename}>
              <AppIcon name="pencil" size={14} color={t.colors.mutedForeground} />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <AppIcon name="trash" size={14} color={t.colors.destructive} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onOpenSettings,
  onCollapse,
}: {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
  onOpenSettings: () => void
  onCollapse: () => void
}) {
  const t = useTheme()
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? conversations.filter((c) => c.title.toLowerCase().includes(needle)) : conversations
  }, [conversations, query])
  const today = visible.filter((c) => Date.now() - c.createdAt < 86_400_000)
  const earlier = visible.filter((c) => Date.now() - c.createdAt >= 86_400_000)

  const group = (name: string, items: Conversation[]) =>
    items.length === 0 ? null : (
      <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 12 }}>
        <Text size="xs" tone="muted" weight="medium" style={{ paddingLeft: 10, paddingBottom: 4 }}>
          {name}
        </Text>
        {items.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeId}
            onSelect={() => onSelect(conversation.id)}
            onRename={() => onRename(conversation.id)}
            onDelete={() => onDelete(conversation.id)}
          />
        ))}
      </div>
    )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100%',
        backgroundColor: t.colors.sidebar,
        borderRightWidth: 1,
        borderColor: t.colors.sidebarBorder,
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: HEADER_HEIGHT, paddingLeft: TRAFFIC_LIGHT_CLEARANCE, paddingRight: 8, gap: 4, flexShrink: 0 }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="iconSm" testId="sidebar-toggle" onClick={onCollapse}>
              <AppIcon name="panelLeft" color={t.colors.mutedForeground} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Hide sidebar</TooltipContent>
        </Tooltip>
        <div style={{ flexGrow: 1 }} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="iconSm" testId="new-chat" onClick={onNew}>
              <AppIcon name="plus" color={t.colors.mutedForeground} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">New chat</TooltipContent>
        </Tooltip>
      </div>

      <div style={{ paddingLeft: 10, paddingRight: 10, paddingBottom: 10 }}>
        <Input
          size="sm"
          placeholder="Search chats"
          value={query}
          onValueChange={setQuery}
          testId="search"
          leading={<AppIcon name="search" size={14} color={t.colors.mutedForeground} />}
          style={{ backgroundColor: t.colors.background }}
        />
      </div>

      <ScrollArea style={{ flexGrow: 1, paddingLeft: 10, paddingRight: 10 }}>
        {group('Today', today)}
        {group('Earlier', earlier)}
        {visible.length === 0 ? (
          <Text size="sm" tone="muted" style={{ paddingLeft: 10, paddingTop: 8 }}>
            No chats match.
          </Text>
        ) : null}
      </ScrollArea>

      <Separator />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingLeft: 14, paddingRight: 8, flexShrink: 0 }}>
        <Avatar fallback="You" size={26} />
        <Text size="sm" weight="medium" style={{ flexGrow: 1 }}>
          You
        </Text>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="iconSm" testId="settings" onClick={onOpenSettings}>
              <AppIcon name="settings" color={t.colors.mutedForeground} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Settings</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

// ── Transcript ─────────────────────────────────────────────────────────────

function UserTurn({ message }: { message: Message }) {
  const t = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
      <div style={{ maxWidth: 520, minWidth: 0, backgroundColor: t.colors.secondary, borderRadius: t.radius.xl, paddingTop: 8, paddingBottom: 8, paddingLeft: 14, paddingRight: 14 }}>
        <Text style={{ minWidth: 0, maxWidth: '100%' }}>{message.content}</Text>
      </div>
    </div>
  )
}

function ThinkingFold({ text, streaming }: { text: string; streaming: boolean }) {
  const t = useTheme()
  return (
    <Collapsible>
      <CollapsibleTrigger
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, height: 24, cursor: 'pointer', alignSelf: 'flex-start' }}
      >
        {(state) => (
          <>
            <AppIcon name="brain" size={13} color={t.colors.mutedForeground} />
            <Text size="sm" tone="muted">
              {streaming ? 'Thinking' : 'Thought'}
            </Text>
            {streaming ? <Spinner size={4} /> : <AppIcon name={state.open ? 'chevronDown' : 'chevronRight'} size={12} color={t.colors.mutedForeground} />}
          </>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent style={{ paddingLeft: 19, paddingTop: 4, paddingBottom: 4 }}>
        <Text size="sm" tone="muted" style={{ minWidth: 0, maxWidth: '100%' }}>
          {text}
        </Text>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ToolCard({ tool }: { tool: ToolCall }) {
  const t = useTheme()
  const running = tool.output === undefined
  return (
    <Card style={{ gap: 0, paddingTop: 0, paddingBottom: 0, borderRadius: t.radius.lg, boxShadow: undefined }}>
      <Collapsible>
        <CollapsibleTrigger style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, paddingLeft: 12, paddingRight: 12, cursor: 'pointer' }}>
          {(state) => (
            <>
              <AppIcon name="wrench" size={14} color={t.colors.mutedForeground} />
              <Text size="sm" mono style={{ flexGrow: 1 }}>
                {tool.name}
              </Text>
              {running ? (
                <Badge variant="secondary">
                  <Spinner size={3} /> running
                </Badge>
              ) : (
                <Badge variant="success">done</Badge>
              )}
              <AppIcon name={state.open ? 'chevronDown' : 'chevronRight'} size={12} color={t.colors.mutedForeground} />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 12, paddingRight: 12, paddingBottom: 10 }}>
          <Text size="xs" tone="muted" mono>
            {`input  ${tool.input}`}
          </Text>
          {tool.output !== undefined ? (
            <Text size="xs" tone="muted" mono>
              {`output ${tool.output}`}
            </Text>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function ActionBar({ message }: { message: Message }) {
  const t = useTheme()
  const [copied, setCopied] = useState(false)
  return (
    <div testId="message-actions" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: -6, userSelect: 'none' }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="iconSm"
            testId={`copy-${message.id}`}
            onClick={() => {
              copyToClipboard(message.content)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            <AppIcon name={copied ? 'check' : 'copy'} size={14} color={copied ? t.colors.success : t.colors.mutedForeground} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? 'Copied' : 'Copy'}</TooltipContent>
      </Tooltip>
    </div>
  )
}

const AssistantTurn = memo(function AssistantTurn({ message, theme }: { message: Message; theme: Theme }) {
  const t = theme
  const streaming = message.streaming === true
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', minWidth: 0 }}>
      {message.thinking ? <ThinkingFold text={message.thinking} streaming={streaming && !message.content && !message.tools?.length} /> : null}
      {message.tools?.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
      {message.content ? (
        <markdown source={message.content} theme={toGpuixTheme(t)} style={{ width: '100%', minWidth: 0 }} />
      ) : streaming && !message.thinking ? (
        <Spinner style={{ height: 20 }} />
      ) : null}
      {message.error ? (
        <Text size="sm" tone="destructive">
          {message.error}
        </Text>
      ) : null}
      {!streaming && message.content ? <ActionBar message={message} /> : null}
    </div>
  )
})

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const t = useTheme()
  return (
    <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AppIcon name="sparkle" size={26} color={t.colors.mutedForeground} />
        <Text size="xl" weight="semibold">
          What are we building?
        </Text>
        <Text size="sm" tone="muted">
          Every control in this window is a gpuix-ui component.
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 640 }}>
        {SUGGESTIONS.map((suggestion) => (
          <Card
            key={suggestion.title}
            testId={`suggestion-${suggestion.title}`}
            onClick={() => onPick(suggestion.title)}
            style={{ width: 200, gap: 4, paddingTop: 14, paddingBottom: 14, cursor: 'pointer', hover: { backgroundColor: t.colors.accent } }}
          >
            <CardContent style={{ gap: 4, paddingLeft: 14, paddingRight: 14 }}>
              <CardTitle size="sm" weight="medium">
                {suggestion.title}
              </CardTitle>
              <CardDescription size="xs">{suggestion.body}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const ROW_STYLE = { display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', paddingTop: 10, paddingBottom: 10, paddingLeft: 24, paddingRight: 24 } as const

function Transcript({ messages, listRef }: { messages: Message[]; listRef: React.MutableRefObject<PublicInstance | null> }) {
  const theme = useTheme()
  return (
    <virtual-list ref={listRef} followTail estimatedItemHeight={96} style={{ flexGrow: 1, minHeight: 0, paddingTop: 12, paddingBottom: 12 }}>
      {messages.map((message) => (
        <div key={message.id} style={ROW_STYLE}>
          <div style={{ width: CONTENT_MAX_WIDTH, maxWidth: '100%', minWidth: 0 }}>
            {message.role === 'user' ? <UserTurn message={message} /> : <AssistantTurn message={message} theme={theme} />}
          </div>
        </div>
      ))}
    </virtual-list>
  )
}

// ── Composer ───────────────────────────────────────────────────────────────

function ModelPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const t = useTheme()
  const groups = useMemo(() => {
    const out: { name: string; items: typeof MODELS }[] = []
    for (const model of MODELS) {
      const last = out.at(-1)
      if (last?.name === model.group) last.items.push(model)
      else out.push({ name: model.group, items: [model] })
    }
    return out
  }, [])
  const live = hasClaudeCredentials()
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" variant="ghost" testId="model-picker">
        <AppIcon name="sparkle" size={13} color={t.colors.mutedForeground} />
        <SelectValue size="sm" placeholder="Model" />
      </SelectTrigger>
      <SelectContent side="top" style={{ minWidth: 240 }}>
        {groups.map((group) => (
          <SelectGroup key={group.name}>
            <SelectLabel>{group.name}</SelectLabel>
            {group.items.map((model) => (
              <SelectItem key={model.id} value={model.id} textValue={model.label} description={model.id.startsWith('claude') && !live ? model.description : undefined}>
                {model.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

function Composer({
  value,
  onChange,
  onSend,
  onStop,
  streaming,
  model,
  onModelChange,
  think,
  onThinkChange,
}: {
  value: string
  onChange: (next: string) => void
  onSend: (text: string) => void
  onStop: () => void
  streaming: boolean
  model: string
  onModelChange: (next: string) => void
  think: boolean
  onThinkChange: (next: boolean) => void
}) {
  const t = useTheme()
  const ready = value.trim().length > 0 && !streaming
  const send = (text: string) => {
    const next = text.trim()
    if (!next || streaming) return
    onSend(next)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingLeft: 24, paddingRight: 24, paddingBottom: 16, overflow: 'visible' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          overflow: 'visible',
          backgroundColor: t.colors.card,
          borderRadius: t.radius.xl,
          borderWidth: 1,
          borderColor: t.colors.border,
          boxShadow: t.shadow.md,
          paddingTop: 12,
          paddingBottom: 8,
          paddingLeft: 12,
          paddingRight: 8,
        }}
      >
        <Textarea
          unstyled
          testId="composer"
          value={value}
          placeholder="Message the agent…"
          minRows={1}
          maxRows={6}
          autoFocus
          onValueChange={onChange}
          onSubmit={(event) => send(event.value ?? value)}
          style={{ paddingRight: 4 }}
        />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <ModelPicker value={model} onChange={onModelChange} />
          <Toggle size="sm" pressed={think} onPressedChange={onThinkChange} testId="think-toggle">
            <AppIcon name="brain" size={13} color={think ? t.colors.accentForeground : t.colors.mutedForeground} />
            Think
          </Toggle>
          <div style={{ flexGrow: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 8 }}>
            <Kbd>Enter</Kbd>
            <Text size="xs" tone="muted">
              send
            </Text>
          </div>
          {streaming ? (
            <Button variant="outline" size="iconSm" testId="stop" onClick={onStop} style={{ borderRadius: t.radius.full }}>
              <AppIcon name="stop" size={14} color={t.colors.foreground} />
            </Button>
          ) : (
            <Button size="iconSm" testId="send" disabled={!ready} onClick={() => send(value)} style={{ borderRadius: t.radius.full }}>
              <AppIcon name="send" size={16} color={t.colors.primaryForeground} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Dialogs ────────────────────────────────────────────────────────────────

function RenameDialog({ conversation, onClose, onRename }: { conversation: Conversation | null; onClose: () => void; onRename: (title: string) => void }) {
  const [title, setTitle] = useState(conversation?.title ?? '')
  useEffect(() => setTitle(conversation?.title ?? ''), [conversation])
  const submit = () => {
    if (title.trim()) onRename(title.trim())
    onClose()
  }
  return (
    <Dialog open={conversation !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent style={{ width: 420 }}>
        <DialogHeader>
          <DialogTitle>Rename chat</DialogTitle>
          <DialogDescription>Give this conversation a title you will recognise later.</DialogDescription>
        </DialogHeader>
        <Input testId="rename-input" value={title} onValueChange={setTitle} autoFocus onSubmit={submit} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button testId="rename-save" onClick={submit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ conversation, onClose, onDelete }: { conversation: Conversation | null; onClose: () => void; onDelete: () => void }) {
  return (
    <AlertDialog open={conversation !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent style={{ width: 420 }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
          <AlertDialogDescription>{`“${conversation?.title ?? ''}” and its messages will be gone. This cannot be undone.`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel testId="delete-cancel">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" testId="delete-confirm" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface Settings {
  dark: boolean
  sendOnEnter: boolean
  speed: 'fast' | 'normal' | 'slow'
  defaultModel: string
}

function SettingsDialog({ open, onOpenChange, settings, onChange }: { open: boolean; onOpenChange: (open: boolean) => void; settings: Settings; onChange: (next: Settings) => void }) {
  const t = useTheme()
  const row = (label: string, control: React.ReactNode, hint?: string) => (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 36 }}>
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2 }}>
        <Label>{label}</Label>
        {hint ? (
          <Text size="xs" tone="muted">
            {hint}
          </Text>
        ) : null}
      </div>
      {control}
    </div>
  )
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ width: 520, minHeight: 360 }}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Preferences for this window. Nothing is persisted in the demo.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" style={{ gap: 16 }}>
          <TabsList>
            <TabsTrigger value="general" testId="tab-general">
              General
            </TabsTrigger>
            <TabsTrigger value="model" testId="tab-model">
              Model
            </TabsTrigger>
            <TabsTrigger value="about" testId="tab-about">
              About
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" style={{ flexDirection: 'column', gap: 8 }}>
            {row('Dark appearance', <Switch testId="theme-switch" checked={settings.dark} onCheckedChange={(dark) => onChange({ ...settings, dark })} />, 'Swaps the whole theme, including native markdown and code.')}
            <Separator />
            {row('Send with Enter', <Checkbox testId="enter-checkbox" checked={settings.sendOnEnter} onCheckedChange={(sendOnEnter) => onChange({ ...settings, sendOnEnter })} />, 'Shift+Enter always inserts a newline.')}
          </TabsContent>
          <TabsContent value="model" style={{ flexDirection: 'column', gap: 12 }}>
            <Label>Demo streaming speed</Label>
            <RadioGroup value={settings.speed} onValueChange={(speed) => onChange({ ...settings, speed: speed as Settings['speed'] })} testId="speed-group">
              {(['fast', 'normal', 'slow'] as const).map((speed) => (
                <div key={speed} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <RadioGroupItem value={speed} testId={`speed-${speed}`} />
                  <Text size="sm">{speed[0].toUpperCase() + speed.slice(1)}</Text>
                </div>
              ))}
            </RadioGroup>
            <Separator />
            <Label>Default model for new chats</Label>
            <Select value={settings.defaultModel} onValueChange={(defaultModel) => onChange({ ...settings, defaultModel })}>
              <SelectTrigger size="sm" style={{ alignSelf: 'flex-start', minWidth: 200 }}>
                <SelectValue size="sm" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id} textValue={model.label}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>
          <TabsContent value="about" style={{ flexDirection: 'column', gap: 8 }}>
            <Text size="sm">gpuix-ui chat example</Text>
            <Text size="sm" tone="muted">
              React components rendered natively by GPUI. No web view. Theme, variants, and behaviour primitives come from @gpuix-ui/core, @gpuix-ui/primitives, and @gpuix-ui/react.
            </Text>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 6, paddingTop: 4 }}>
              <Badge variant="outline">GPUIX 0.7</Badge>
              <Badge variant="outline">{`${IS_MAC ? 'Metal' : 'Vulkan / DirectX'}`}</Badge>
              <Badge variant="secondary" style={{ borderColor: t.colors.border }}>
                {hasClaudeCredentials() ? 'Claude connected' : 'mock agent'}
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ── App ────────────────────────────────────────────────────────────────────

export interface ChatAppProps {
  /** Override the agent. Tests pass the mock with `speed: 0`. */
  agent?: Agent
  /** Milliseconds per mock chunk. */
  speed?: number
  initialDark?: boolean
  /** Optional controlled appearance for embedding in another application. */
  dark?: boolean
  onDarkChange?: (dark: boolean) => void
}

function ChatScreen({ agent: agentProp, speed: speedProp, settings, onSettingsChange }: ChatAppProps & { settings: Settings; onSettingsChange: (next: Settings) => void }) {
  const t = useTheme()
  const { renderer } = useGpuix()
  const { ime } = useWindowInsets()
  const [conversations, setConversations] = useState<Conversation[]>(() => [newConversation()])
  const [activeId, setActiveId] = useState(() => conversations[0]!.id)
  const [collapsed, setCollapsed] = useState(false)
  const [draft, setDraft] = useState('')
  const [model, setModel] = useState(settings.defaultModel)
  const [think, setThink] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<PublicInstance | null>(null)

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0]!
  const streaming = active.messages.at(-1)?.streaming === true
  const speed = speedProp ?? (settings.speed === 'fast' ? 6 : settings.speed === 'slow' ? 60 : 24)

  const updateConversation = useCallback((id: string, update: (c: Conversation) => Conversation) => {
    setConversations((current) => current.map((c) => (c.id === id ? update(c) : c)))
  }, [])

  const patchMessage = useCallback(
    (conversationId: string, messageId: string, patch: (m: Message) => Message) => {
      updateConversation(conversationId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === messageId ? patch(m) : m)) }))
    },
    [updateConversation],
  )

  const send = useCallback(
    (text: string) => {
      const conversationId = active.id
      const userMessage: Message = { id: nextId('m'), role: 'user', content: text }
      const reply: Message = { id: nextId('m'), role: 'assistant', content: '', streaming: true }
      updateConversation(conversationId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? titleFrom(text) : c.title,
        messages: [...c.messages, userMessage, reply],
      }))
      setDraft('')
      const controller = new AbortController()
      abortRef.current = controller
      const history = [...active.messages.filter((m) => !m.streaming), userMessage].map((m) => ({ role: m.role, content: m.content }))
      const agent = agentProp ?? pickAgent(model)
      const emit = (event: AgentEvent) => {
        if (event.type === 'text') patchMessage(conversationId, reply.id, (m) => ({ ...m, content: m.content + event.text }))
        else if (event.type === 'thinking') {
          if (think) patchMessage(conversationId, reply.id, (m) => ({ ...m, thinking: (m.thinking ?? '') + event.text }))
        } else if (event.type === 'tool_start') {
          patchMessage(conversationId, reply.id, (m) => ({ ...m, tools: [...(m.tools ?? []), { id: event.id, name: event.name, input: event.input }] }))
        } else if (event.type === 'tool_end') {
          patchMessage(conversationId, reply.id, (m) => ({ ...m, tools: (m.tools ?? []).map((tool) => (tool.id === event.id ? { ...tool, output: event.output } : tool)) }))
        } else if (event.type === 'error') patchMessage(conversationId, reply.id, (m) => ({ ...m, error: event.message, streaming: false }))
        else if (event.type === 'done') {
          patchMessage(conversationId, reply.id, (m) => ({ ...m, streaming: false }))
          if (abortRef.current === controller) abortRef.current = null
        }
      }
      void agent({ messages: history, model, signal: controller.signal, speed }, emit)
    },
    [active, agentProp, model, patchMessage, speed, think, updateConversation],
  )

  const stop = useCallback(() => abortRef.current?.abort(), [])

  const createConversation = useCallback(() => {
    const conversation = newConversation()
    setConversations((current) => [conversation, ...current])
    setActiveId(conversation.id)
    setDraft('')
  }, [])

  const removeConversation = useCallback(
    (id: string) => {
      setConversations((current) => {
        const rest = current.filter((c) => c.id !== id)
        if (rest.length === 0) {
          const fresh = newConversation()
          setActiveId(fresh.id)
          return [fresh]
        }
        if (id === activeId) setActiveId(rest[0]!.id)
        return rest
      })
    },
    [activeId],
  )

  // Follow new turns. `followTail` handles streaming growth; this handles a send.
  const rowCount = active.messages.length
  useEffect(() => {
    const id = listRef.current?.id
    if (id == null || rowCount === 0 || !renderer?.scrollToItem) return
    renderer.scrollToItem(id, rowCount - 1)
  }, [renderer, rowCount, activeId])

  const renamingConversation = conversations.find((c) => c.id === renaming) ?? null
  const deletingConversation = conversations.find((c) => c.id === deleting) ?? null
  const live = model.startsWith('claude') && hasClaudeCredentials()

  return (
    <TooltipProvider delayDuration={400}>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', backgroundColor: t.colors.background }}>
        <motion.div
          initial={false}
          animate={{ width: collapsed ? 0 : SIDEBAR_WIDTH }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'row', height: '100%', flexShrink: 0, overflow: 'hidden' }}
        >
          <Sidebar
            conversations={conversations}
            activeId={active.id}
            onSelect={setActiveId}
            onNew={createConversation}
            onRename={setRenaming}
            onDelete={setDeleting}
            onOpenSettings={() => setSettingsOpen(true)}
            onCollapse={() => setCollapsed(true)}
          />
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, height: '100%', paddingBottom: ime.bottom }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, height: HEADER_HEIGHT, paddingLeft: collapsed ? TRAFFIC_LIGHT_CLEARANCE : 12, paddingRight: 12, flexShrink: 0, userSelect: 'none' }}>
            {collapsed ? (
              <Button variant="ghost" size="iconSm" testId="sidebar-expand" onClick={() => setCollapsed(false)}>
                <AppIcon name="panelLeft" color={t.colors.mutedForeground} />
              </Button>
            ) : null}
            <Text weight="medium" truncate style={{ flexGrow: 1 }} testId="title">
              {active.title}
            </Text>
            <Badge variant={live ? 'success' : 'outline'}>{live ? 'live' : 'mock'}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="iconSm" testId="header-menu">
                  <AppIcon name="ellipsis" color={t.colors.mutedForeground} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                <DropdownMenuItem testId="menu-rename" onSelect={() => setRenaming(active.id)}>
                  <AppIcon name="pencil" size={14} color={t.colors.mutedForeground} />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem testId="menu-clear" onSelect={() => updateConversation(active.id, (c) => ({ ...c, messages: [] }))}>
                  <AppIcon name="messageSquare" size={14} color={t.colors.mutedForeground} />
                  Clear messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem testId="menu-delete" variant="destructive" onSelect={() => setDeleting(active.id)}>
                  <AppIcon name="trash" size={14} color={t.colors.destructive} />
                  Delete chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {active.messages.length === 0 ? <EmptyState onPick={send} /> : <Transcript messages={active.messages} listRef={listRef} />}

          <Composer
            value={draft}
            onChange={setDraft}
            onSend={send}
            onStop={stop}
            streaming={streaming}
            model={model}
            onModelChange={setModel}
            think={think}
            onThinkChange={setThink}
          />
        </div>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onChange={onSettingsChange} />
        <RenameDialog
          conversation={renamingConversation}
          onClose={() => setRenaming(null)}
          onRename={(title) => renaming && updateConversation(renaming, (c) => ({ ...c, title }))}
        />
        <DeleteDialog
          conversation={deletingConversation}
          onClose={() => setDeleting(null)}
          onDelete={() => {
            if (deleting) removeConversation(deleting)
            setDeleting(null)
          }}
        />
      </div>
    </TooltipProvider>
  )
}

export function ChatApp(props: ChatAppProps) {
  const [settings, setSettings] = useState<Settings>({ dark: props.initialDark ?? true, sendOnEnter: true, speed: 'normal', defaultModel: 'mock' })
  const effectiveSettings = { ...settings, dark: props.dark ?? settings.dark }
  return (
    <ThemeProvider theme={effectiveSettings.dark ? darkTheme : lightTheme}>
      <ChatScreen {...props} settings={effectiveSettings} onSettingsChange={next => { setSettings(next); if (next.dark !== effectiveSettings.dark) props.onDarkChange?.(next.dark) }} />
    </ThemeProvider>
  )
}

export { mockAgent }

const isEntryPoint =
  typeof Bun !== 'undefined' ? Bun.isStandaloneExecutable || Bun.main === import.meta.path : typeof process !== 'undefined' && process.argv[1]?.endsWith('app.tsx')

if (isEntryPoint) {
  render(<ChatApp />, {
    title: 'gpuix-ui Chat',
    appName: 'gpuix-ui Chat',
    width: 1180,
    height: 800,
    minWidth: 720,
    minHeight: 480,
    titlebarTransparent: true,
    trafficLightX: 16,
    trafficLightY: 17,
    focus: process.env.GPUIX_BACKGROUND !== '1',
  })
}
