/** Runnable shadcn/ui Neutral / New York examples, painted by GPUI. */
import React, { useState, type ReactNode } from 'react'
import { render } from '@gpuix/react'
import { ThemeProvider, lightTheme, darkTheme, useTheme, type Style } from '@gpuix-ui/core'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Icon,
  Input,
  Label,
  ScrollArea,
  Separator,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  Toaster,
  toast,
} from '@gpuix-ui/react'
import { ChatApp, mockAgent } from '../chat/app'

const row: Style = { display: 'flex', flexDirection: 'row', alignItems: 'center' }
const column: Style = { display: 'flex', flexDirection: 'column' }
const glyphs = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  credit: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>',
  moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
} as const

function Glyph({ name, color }: { name: keyof typeof glyphs; color?: string }) {
  const t = useTheme()
  return (
    <Icon
      color={color ?? t.colors.mutedForeground}
      source={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyphs[name]}</svg>`}
    />
  )
}

const sales = [
  ['Olivia Martin', 'olivia.martin@email.com', '+$1,999.00'],
  ['Jackson Lee', 'jackson.lee@email.com', '+$39.00'],
  ['Isabella Nguyen', 'isabella.nguyen@email.com', '+$299.00'],
  ['William Kim', 'william.kim@email.com', '+$99.00'],
  ['Sofia Davis', 'sofia.davis@email.com', '+$39.00'],
]
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const revenue = [2600, 3800, 3100, 4900, 3600, 5200, 4300, 5800, 4700, 3500, 5100, 4400]

export function Dashboard() {
  const t = useTheme()
  const [period, setPeriod] = useState('overview')
  const [year, setYear] = useState(2024)
  const [query, setQuery] = useState('')
  const visibleSales = sales.filter((s) => s.join(' ').toLowerCase().includes(query.toLowerCase()))
  const analytics = period === 'analytics'
  return (
    <div style={{ ...column, flexGrow: 1, minHeight: 0 }}>
      <div
        style={{
          ...row,
          height: 64,
          paddingLeft: 32,
          paddingRight: 32,
          borderBottomWidth: 1,
          borderColor: t.colors.border,
          gap: 28,
          flexShrink: 0,
        }}
      >
        <div style={{ ...row, gap: 10 }}>
          <Avatar fallback="Acme Inc" size={28} />
          <Text size="sm" weight="semibold">
            Acme Inc.
          </Text>
        </div>
        <Text size="sm" weight="medium">
          Overview
        </Text>
        <Text size="sm" tone="muted">
          Your workspace at a glance
        </Text>
        <div style={{ flexGrow: 1 }} />
        <Input
          testId="sales-search"
          placeholder="Search customers..."
          value={query}
          onValueChange={setQuery}
          style={{ width: 230 }}
          leading={<Icon name="search" color={t.colors.mutedForeground} />}
        />
        <Avatar fallback="Sofia Davis" />
      </div>
      <ScrollArea style={{ flexGrow: 1 }}>
        <div style={{ ...column, padding: 32, gap: 24, flexShrink: 0 }}>
          <div style={{ ...row, justifyContent: 'space-between', gap: 16 }}>
            <Text weight="bold" style={{ fontSize: 30, lineHeight: 36 }}>
              Dashboard
            </Text>
            <div style={{ ...row, gap: 8 }}>
              <Button testId="date-range" variant="outline" onClick={() => setYear((y) => (y === 2024 ? 2025 : 2024))}>
                <Glyph name="calendar" color={t.colors.foreground} />
                {`Jan 1 – Dec 31, ${year}`}
              </Button>
              <Button
                testId="download-report"
                onClick={() => {
                  const csv =
                    'month,revenue\n' + months.map((m, i) => `${m},${Math.round(revenue[i]! * (year === 2025 ? 1.12 : 1))}`).join('\n')
                  if (typeof Bun !== 'undefined') {
                    const out = `${process.env.HOME ?? '.'}/Downloads/acme-revenue-${year}.csv`
                    Bun.write(out, csv)
                      .then(() => toast.success({ title: 'Report exported', description: out }))
                      .catch(() => toast.error('Could not save report'))
                  } else toast('Report preview ready')
                }}
              >
                <Glyph name="download" color={t.colors.primaryForeground} />
                Download
              </Button>
            </div>
          </div>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger testId="overview-tab" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger testId="analytics-tab" value="analytics">
                Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div style={{ ...row, alignItems: 'stretch', gap: 16, flexWrap: 'wrap' }}>
            {(
              [
                ['Total Revenue', year === 2024 ? '$45,231.89' : '$50,659.72', '+20.1% from last month', 'dollar'],
                ['Subscriptions', '+2,350', '+180.1% from last month', 'users'],
                ['Sales', '+12,234', '+19% from last month', 'credit'],
                ['Active Now', '+573', '+201 since last hour', 'activity'],
              ] as const
            ).map(([title, value, detail, icon]) => (
              <Card key={title} style={{ flexGrow: 1, flexBasis: 210, gap: 8 }}>
                <CardHeader style={{ ...row, justifyContent: 'space-between' }}>
                  <Text size="sm" weight="medium">
                    {title}
                  </Text>
                  <Glyph name={icon} />
                </CardHeader>
                <CardContent style={{ gap: 4 }}>
                  <Text weight="bold" style={{ fontSize: 24, lineHeight: 32 }}>
                    {value}
                  </Text>
                  <Text size="xs" tone="muted">
                    {detail}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </div>
          <div style={{ ...row, alignItems: 'stretch', gap: 16, flexWrap: 'wrap' }}>
            <Card style={{ flexGrow: 4, flexBasis: 460, minWidth: 0 }}>
              <CardHeader>
                <CardTitle>{analytics ? 'Subscription growth' : 'Overview'}</CardTitle>
                <CardDescription>
                  {analytics ? 'Monthly new subscriptions across all plans.' : 'Your revenue over the last 12 months.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ ...row, height: 260, alignItems: 'stretch', gap: 12 }}>
                  <div style={{ ...column, width: 48, flexShrink: 0, justifyContent: 'space-between', paddingBottom: 28 }}>
                    {['$6,000', '$4,500', '$3,000', '$1,500', '$0'].map((v) => (
                      <Text key={v} size="xs" tone="muted" style={{ whiteSpace: 'nowrap' }}>
                        {analytics ? v.replace('$', '') : v}
                      </Text>
                    ))}
                  </div>
                  <div style={{ ...row, flexGrow: 1, alignItems: 'stretch', gap: 10 }}>
                    {months.map((m, i) => (
                      <div
                        key={m}
                        style={{ ...column, flexGrow: 1, flexBasis: 0, justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}
                      >
                        <div
                          testId={`bar-${m}`}
                          style={{
                            width: '100%',
                            height: ((analytics ? revenue[11 - i]! * 0.75 : revenue[i]!) / 6000) * 224 * (year === 2025 ? 1.08 : 1),
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            backgroundColor: t.colors.primary,
                          }}
                        />
                        <Text size="xs" tone="muted">
                          {m}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card style={{ flexGrow: 3, flexBasis: 350, minWidth: 0 }}>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>You made 265 sales this month.</CardDescription>
              </CardHeader>
              <CardContent style={{ gap: 26 }}>
                {visibleSales.map(([name, email, amount]) => (
                  <div key={name} style={{ ...row, gap: 12 }}>
                    <Avatar fallback={name} size={36} />
                    <div style={{ ...column, gap: 2, flexGrow: 1, minWidth: 0 }}>
                      <Text size="sm" weight="medium">
                        {name}
                      </Text>
                      <Text size="sm" tone="muted" truncate>
                        {email}
                      </Text>
                    </div>
                    <Text size="sm" weight="medium">
                      {amount}
                    </Text>
                  </div>
                ))}
                {!visibleSales.length && (
                  <Text size="sm" tone="muted">
                    No customers found.
                  </Text>
                )}
              </CardContent>
            </Card>
          </div>
          <Text size="xs" tone="muted">
            Demo workspace · All amounts in USD
          </Text>
        </div>
      </ScrollArea>
    </div>
  )
}

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div style={{ ...column, gap: 8, flexShrink: 0 }}>
      <Label>{label}</Label>
      {children}
      {help && (
        <Text size="sm" tone="muted">
          {help}
        </Text>
      )}
    </div>
  )
}

export function Settings({ dark, onDarkChange }: { dark: boolean; onDarkChange: (value: boolean) => void }) {
  const t = useTheme()
  const [page, setPage] = useState('Profile')
  const [name, setName] = useState('shadcn')
  const [email, setEmail] = useState('m@example.com')
  const [bio, setBio] = useState('I own a computer.')
  const [website, setWebsite] = useState('https://shadcn.com')
  const [social, setSocial] = useState('https://twitter.com/shadcn')
  const [notifications, setNotifications] = useState(true)
  const [marketing, setMarketing] = useState(false)
  const [saved, setSaved] = useState(false)
  return (
    <ScrollArea testId="settings-scroll" style={{ flexGrow: 1 }}>
      <div style={{ ...column, padding: 32, gap: 20, flexShrink: 0 }}>
        <div style={{ ...column, gap: 6 }}>
          <Text weight="bold" style={{ fontSize: 30, lineHeight: 36 }}>
            Settings
          </Text>
          <Text size="sm" tone="muted">
            Manage your account settings and set your preferences.
          </Text>
        </div>
        <Separator />
        <div style={{ ...row, alignItems: 'flex-start', gap: 48 }}>
          <div style={{ ...column, width: 200, gap: 4, flexShrink: 0 }}>
            {['Profile', 'Account', 'Appearance', 'Notifications'].map((item) => (
              <Button
                key={item}
                testId={`settings-${item.toLowerCase()}`}
                variant={page === item ? 'secondary' : 'ghost'}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => {
                  setPage(item)
                  setSaved(false)
                }}
              >
                {item}
              </Button>
            ))}
          </div>
          <div style={{ ...column, width: 620, maxWidth: '100%', flexShrink: 1, gap: 20 }}>
            <div style={{ ...column, gap: 6 }}>
              <Text size="xl" weight="semibold">
                {page}
              </Text>
              <Text size="sm" tone="muted">
                {
                  {
                    Profile: 'This is how others will see you on the site.',
                    Account: 'Update your account information.',
                    Appearance: 'Customize the appearance of the app.',
                    Notifications: 'Choose how you want to be notified.',
                  }[page]
                }
              </Text>
            </div>
            <Separator />
            {page === 'Profile' && (
              <>
                <Field label="Username" help="This is your public display name. You can change it once every 30 days.">
                  <Input
                    testId="profile-name"
                    value={name}
                    onValueChange={(v) => {
                      setName(v)
                      setSaved(false)
                    }}
                  />
                </Field>
                <Field label="Email" help="You can manage verified email addresses in your account settings.">
                  <Input
                    testId="profile-email"
                    value={email}
                    onValueChange={(v) => {
                      setEmail(v)
                      setSaved(false)
                    }}
                  />
                </Field>
                <Field label="Bio" help="You can @mention other users and organizations to link to them.">
                  <Textarea
                    testId="profile-bio"
                    value={bio}
                    onValueChange={(v) => {
                      setBio(v)
                      setSaved(false)
                    }}
                    minRows={2}
                  />
                </Field>
                <Field label="URLs" help="Add links to your website, blog, or social profiles.">
                  <Input value={website} onValueChange={setWebsite} />
                  <Input value={social} onValueChange={setSocial} />
                </Field>
              </>
            )}
            {page === 'Account' && (
              <>
                <Field label="Name">
                  <Input value={name} onValueChange={setName} />
                </Field>
                <Field label="Email">
                  <Input value={email} onValueChange={setEmail} />
                </Field>
                <Text size="sm" tone="muted">
                  Your account belongs to the Acme Inc. workspace.
                </Text>
              </>
            )}
            {page === 'Appearance' && (
              <Field label="Theme" help="Select the theme for the application.">
                <div style={{ ...row, gap: 16 }}>
                  {[false, true].map((value) => (
                    <Button
                      key={String(value)}
                      testId={value ? 'appearance-dark' : 'appearance-light'}
                      variant="outline"
                      onClick={() => onDarkChange(value)}
                      style={{
                        width: 180,
                        height: 100,
                        borderColor: dark === value ? t.colors.primary : t.colors.border,
                        borderWidth: dark === value ? 2 : 1,
                      }}
                    >
                      <Glyph name={value ? 'moon' : 'sun'} />
                      {value ? 'Dark' : 'Light'}
                      {dark === value && <Icon name="check" color={t.colors.foreground} />}
                    </Button>
                  ))}
                </div>
              </Field>
            )}
            {page === 'Notifications' && (
              <>
                {(
                  [
                    ['Communication emails', 'Receive emails about your account activity.', notifications, setNotifications],
                    ['Marketing emails', 'Receive emails about new products and features.', marketing, setMarketing],
                  ] as const
                ).map(([title, description, checked, change], i) => (
                  <Card key={title} style={{ ...row, padding: 20, justifyContent: 'space-between' }}>
                    <div style={{ ...column, gap: 6 }}>
                      <Text size="sm" weight="medium">
                        {title}
                      </Text>
                      <Text size="sm" tone="muted">
                        {description}
                      </Text>
                    </div>
                    <Switch testId={`notification-${i}`} checked={checked} onCheckedChange={change} />
                  </Card>
                ))}
              </>
            )}
            <div style={{ ...row, gap: 12 }}>
              <Button
                testId="save-settings"
                onClick={() => {
                  if (!name.trim() || !email.includes('@')) {
                    toast.error('Enter a name and a valid email.')
                    return
                  }
                  setSaved(true)
                  toast.success({ title: 'Preferences updated', description: 'Changes are saved for this demo session.' })
                }}
              >
                Update {page.toLowerCase()}
              </Button>
              {saved && (
                <Text testId="saved-state" size="sm" tone="muted">
                  Changes saved
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

export type Example = 'dashboard' | 'chat' | 'settings'
export function Showcase({ initialPage = 'dashboard', initialDark = false }: { initialPage?: Example; initialDark?: boolean }) {
  const [page, setPage] = useState<Example>(initialPage)
  const [dark, setDark] = useState(initialDark)
  const t = dark ? darkTheme : lightTheme
  return (
    <ThemeProvider theme={t}>
      <div style={{ ...column, width: '100%', height: '100%', backgroundColor: t.colors.background }}>
        <div
          style={{
            ...row,
            height: 64,
            paddingLeft: 32,
            paddingRight: 32,
            gap: 28,
            borderBottomWidth: 1,
            borderColor: t.colors.border,
            flexShrink: 0,
          }}
        >
          <Text weight="semibold" style={{ fontSize: 18 }}>
            gpuix-ui
          </Text>
          <Separator orientation="vertical" style={{ height: 20 }} />
          <Tabs value={page} onValueChange={(v) => setPage(v as Example)}>
            <TabsList style={{ backgroundColor: '#00000000', gap: 8 }}>
              <TabsTrigger value="dashboard" testId="example-dashboard">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="chat" testId="example-chat">
                Agent Chat
              </TabsTrigger>
              <TabsTrigger value="settings" testId="example-settings">
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div style={{ flexGrow: 1 }} />
          <Badge variant="outline">Examples</Badge>
          <Button testId="toggle-theme" variant="ghost" size="iconSm" onClick={() => setDark((v) => !v)}>
            <Glyph name={dark ? 'sun' : 'moon'} color={t.colors.foreground} />
          </Button>
        </div>
        <div style={{ ...column, flexGrow: 1, minHeight: 0 }}>
          {page === 'dashboard' && <Dashboard />}
          {page === 'chat' && <ChatApp agent={mockAgent} dark={dark} onDarkChange={setDark} speed={0} />}
          {page === 'settings' && <Settings dark={dark} onDarkChange={setDark} />}
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

if (typeof Bun !== 'undefined' && (Bun.isStandaloneExecutable || Bun.main === import.meta.path)) {
  render(<Showcase />, {
    title: 'gpuix-ui · Examples',
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 650,
    focus: process.env.GPUIX_BACKGROUND !== '1',
  })
}
