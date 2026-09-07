/**
 * The agent behind the chat. Two providers share one event stream:
 *
 * - `mockAgent` answers from canned markdown with a fake tool call, so the app
 *   runs (and its tests pass) with no network and no key.
 * - `claudeAgent` streams from the Claude API through the official SDK when
 *   `ANTHROPIC_API_KEY` is set (or `ant auth login` has stored a profile).
 */

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export type AgentEvent =
  | { type: 'thinking'; text: string }
  | { type: 'text'; text: string }
  | { type: 'tool_start'; id: string; name: string; input: string }
  | { type: 'tool_end'; id: string; output: string }
  | { type: 'error'; message: string }
  | { type: 'done' }

export interface AgentRequest {
  messages: ChatTurn[]
  model: string
  signal: AbortSignal
  /** Milliseconds between streamed chunks in the mock. 0 in tests. */
  speed?: number
}

export type Agent = (request: AgentRequest, emit: (event: AgentEvent) => void) => Promise<void>

interface Script {
  match?: RegExp
  thinking: string
  tool?: { name: string; input: string; output: string }
  answer: string
}

const CANNED: Script[] = [
  {
    match: /gpuix|gpui|native|electron/i,
    thinking: 'The user is asking about the rendering stack. I should explain GPUIX briefly and mention the tradeoffs.',
    tool: { name: 'search_docs', input: '{"query": "GPUIX architecture"}', output: '3 results: README.md#architecture, AGENTS.md, docs/custom-elements-plan.md' },
    answer: `**GPUIX** is React bound to GPUI, the GPU-accelerated UI framework behind the Zed editor.

React reconciles your tree, ships minimal mutations to Rust, and GPUI paints through Metal, DirectX, or Vulkan. There is no web view anywhere in the process.

| Layer | Owner | What it does |
|---|---|---|
| Components | You | Plain React with \`style\` objects |
| Reconciler | \`@gpuix/react\` | Turns commits into mutations |
| Retained tree | \`@gpuix/native\` | Rust mirror GPUI reads each frame |
| Paint | GPUI | Layout via Taffy, GPU draw |

The whole chat you are looking at, menus and dialogs included, is built from **gpuix-ui** components on top of that stack.`,
  },
  {
    match: /code|example|function|typescript|rust/i,
    thinking: 'A code example would be the clearest answer here.',
    answer: `Here is a button built with the \`sv\` variant helper:

\`\`\`tsx
const button = sv({
  base: { display: 'flex', borderRadius: 6, cursor: 'pointer' },
  variants: {
    variant: {
      default: { backgroundColor: '#FAFAFA' },
      ghost: { hover: { backgroundColor: '#FFFFFF0D' } },
    },
  },
  defaultVariants: { variant: 'default' },
})

<div style={button({ variant: 'ghost' })}>
  <text style={{ color: '#FAFAFA' }}>Click</text>
</div>
\`\`\`

Two rules keep GPUI happy:

1. Every \`<text>\` sets a \`color\`. Nothing is inherited.
2. Overlays go through \`anchored\`, never \`position: absolute\`.`,
  },
  {
    match: /hello|hi\b|hey/i,
    thinking: 'A greeting. Keep it short and offer directions.',
    answer: `Hi! I am the demo agent inside the **gpuix-ui** chat example.

Try asking me about:
- how GPUIX renders React on the GPU
- a code example using the component library
- anything else, and I will improvise`,
  },
]

const FALLBACK: Script = {
  thinking: 'I do not have a specific answer prepared, so I will explain what this demo is and how to hook up a real model.',
  answer: `I am a **mock agent**, so I only know a few topics. This reply proves the streaming path: markdown, a thinking fold, and a tool card all render through native GPUIX elements while tokens arrive.

To talk to a real model, set \`ANTHROPIC_API_KEY\` and pick a Claude model in the composer. The app then streams from the Claude API through \`@anthropic-ai/sdk\`.

> Everything in this window is a gpuix-ui component: the sidebar rows, the model picker, the dialogs, this transcript.`,
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

function chunks(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? [text]
}

export const mockAgent: Agent = async ({ messages, signal, speed = 24 }, emit) => {
  const last = messages.at(-1)?.content ?? ''
  const script = CANNED.find((entry) => entry.match?.test(last)) ?? FALLBACK
  let toolId = 0
  try {
    await sleep(speed * 4, signal)
    for (const chunk of chunks(script.thinking)) {
      emit({ type: 'thinking', text: chunk })
      await sleep(speed / 2, signal)
    }
    if (script.tool) {
      const id = `tool-${++toolId}`
      emit({ type: 'tool_start', id, name: script.tool.name, input: script.tool.input })
      await sleep(speed * 20, signal)
      emit({ type: 'tool_end', id, output: script.tool.output })
      await sleep(speed * 4, signal)
    }
    for (const chunk of chunks(script.answer)) {
      emit({ type: 'text', text: chunk })
      await sleep(speed, signal)
    }
    emit({ type: 'done' })
  } catch (error) {
    if ((error as Error).name === 'AbortError') emit({ type: 'done' })
    else emit({ type: 'error', message: String(error) })
  }
}

/** Streams from the Claude API. Loaded lazily so the mock path never touches the SDK. */
export const claudeAgent: Agent = async ({ messages, model, signal }, emit) => {
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic()
    const stream = client.beta.messages.stream(
      {
        model,
        max_tokens: 64000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        thinking: { type: 'adaptive', display: 'summarized' },
        system: 'You are a concise assistant inside a native desktop chat app. Answer in GitHub-flavoured markdown.',
        messages: messages.map((turn) => ({ role: turn.role, content: turn.content })),
      },
      { signal },
    )
    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') emit({ type: 'text', text: event.delta.text })
        else if (event.delta.type === 'thinking_delta') emit({ type: 'thinking', text: event.delta.thinking })
      }
    }
    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') emit({ type: 'error', message: 'The model declined this request.' })
    emit({ type: 'done' })
  } catch (error) {
    if ((error as Error).name === 'AbortError' || (error as Error).name === 'APIUserAbortError') emit({ type: 'done' })
    else emit({ type: 'error', message: (error as Error).message ?? String(error) })
  }
}

export function hasClaudeCredentials(): boolean {
  if (typeof process === 'undefined') return false
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE)
}

export function pickAgent(model: string): Agent {
  return model.startsWith('claude') && hasClaudeCredentials() ? claudeAgent : mockAgent
}
