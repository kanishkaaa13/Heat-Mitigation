import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, X } from 'lucide-react'

interface ChatMessage {
  id: number
  sender: 'user' | 'ai'
  text: string
  typed?: boolean
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'user',
    text: 'Why is Sector 8 hotter?',
  },
  {
    id: 2,
    sender: 'ai',
    text: 'Sector 8 has 89% impervious surface, only 6% tree cover, and dark asphalt rooftops. This combination traps solar radiation, causing LST 7°C above city average.',
    typed: true,
  },
  {
    id: 3,
    sender: 'user',
    text: 'Which intervention gives maximum cooling?',
  },
  {
    id: 4,
    sender: 'ai',
    text: 'Tree cover in Zone A gives the highest ROI: −2.3°C for ₹4.2 Crore.',
    typed: true,
  },
]

export function AiChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [typingId, setTypingId] = useState<number | null>(null)
  const [typingText, setTypingText] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingText, open])

  const sendMessage = () => {
    const trimmed = draft.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    }

    const aiReply = `Analyzing satellite data for ${trimmed}... Based on ECOSTRESS + Landsat 8 readings, I recommend prioritizing green infrastructure in high-density zones.`
    const aiMessage: ChatMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      text: aiReply,
      typed: true,
    }

    setMessages(prev => [...prev, userMessage, aiMessage])
    setDraft('')
    setTypingId(aiMessage.id)
    setTypingText('')

    window.setTimeout(() => {
      let index = 0
      const fullText = aiReply
      const interval = window.setInterval(() => {
        setTypingText(fullText.slice(0, index + 1))
        index += 1
        if (index >= fullText.length) {
          window.clearInterval(interval)
          setTypingId(null)
        }
      }, 24)
    }, 800)
  }

  const visibleMessages = useMemo(() => {
    if (!typingId) return messages
    return messages.map(message => (message.id === typingId ? { ...message, text: typingText } : message))
  }, [messages, typingId, typingText])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 text-2xl text-[#07101b] shadow-[0_0_0_0_rgba(34,211,238,0.35)] transition hover:scale-105"
        style={{ animation: 'assistantPulse 1.8s infinite' }}
        aria-label="Toggle AI assistant"
      >
        💬
      </button>

      {open && (
        <div className="mt-3 w-80 overflow-hidden rounded-[24px] border border-white/10 bg-[#0B1220]/90 p-3 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <span>🤖</span>
              <span>Urban Heat AI</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close AI assistant"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex h-[24rem] flex-col gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3">
            {visibleMessages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.sender === 'user' ? 'bg-cyan-400/20 text-cyan-100' : 'bg-white/5 text-gray-200'}`}>
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <input
              value={draft}
              onChange={event => setDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              className="flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/40"
              placeholder="Ask about your city's heat..."
            />
            <button
              type="button"
              onClick={sendMessage}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-[#07101b] transition hover:brightness-110"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
