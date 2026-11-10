"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MessageCircle, Send, X, Sparkles, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/format";
import { DEFAULT_SUGGESTIONS } from "@/lib/suggestions";

type ChatProps = { assistantName: string; greeting: string; storageKey: string; suggestions?: string[] };


function safeStorage<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

/** Floating launcher shown on every page (except /concierge). Opens on `window.dispatchEvent(new Event("open-chat"))` or #chat links. */
export function ChatWidget({ hideOnHome, ...props }: ChatProps & { hideOnHome?: boolean }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const clearQuestion = useCallback(() => setQuestion(""), []);
  const pathname = usePathname();
  useEffect(() => {
    // An "open-chat" CustomEvent may carry { question } to send straight away (e.g. the hero ask box).
    const onOpen = (e: Event) => {
      const q = (e as CustomEvent<{ question?: string } | undefined>).detail?.question?.trim();
      if (q) setQuestion(q);
      setOpen(true);
    };
    const onHash = () => window.location.hash === "#chat" && setOpen(true);
    window.addEventListener("open-chat", onOpen);
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => {
      window.removeEventListener("open-chat", onOpen);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
  // The lounge home page *is* the chat, so the floating launcher would duplicate it.
  if (pathname?.endsWith("/concierge") || (hideOnHome && pathname === "/")) return null;

  return (
    <>
      {open && (
        <div className="chat-pop fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col overflow-hidden rounded-[calc(var(--radius)+6px)] border bg-background shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[620px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px]">
          <ChatPanel {...props} initialQuestion={question} onQuestionSent={clearQuestion} onClose={() => setOpen(false)} />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : `Chat with ${props.assistantName}`}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 sm:bottom-6 sm:right-6"
      >
        {open ? <X /> : <MessageCircle />}
      </button>
    </>
  );
}

/** Shared chat state: session persistence, transport, send/reset. Used by the widget and the lounge home. */
export function useConciergeChat(storageKey: string) {
  const sessionKey = `chat:${storageKey}:session`;
  const msgsKey = `chat:${storageKey}:messages`;
  // Start empty on the server and first client render (hydration-safe), then restore from localStorage.
  const [sessionId, setSessionId] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: () => ({ sessionId }) }), [sessionId]);
  const { messages, sendMessage, status, error, setMessages, clearError } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const saved = safeStorage(() => localStorage.getItem(sessionKey), null);
    const restored = safeStorage<UIMessage[]>(() => JSON.parse(localStorage.getItem(msgsKey) ?? "[]"), []);
    /* eslint-disable react-hooks/set-state-in-effect -- syncing from an external store (localStorage) */
    setSessionId(saved ?? crypto.randomUUID());
    if (restored.length) setMessages(restored);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [sessionKey, msgsKey, setMessages]);
  useEffect(() => {
    if (sessionId) safeStorage(() => localStorage.setItem(sessionKey, sessionId), undefined);
  }, [sessionId, sessionKey]);
  useEffect(() => {
    if (status === "ready" && sessionId) safeStorage(() => localStorage.setItem(msgsKey, JSON.stringify(messages.slice(-30))), undefined);
  }, [messages, status, msgsKey, sessionId]);

  // Stable between renders while `busy` is unchanged, so effects that depend on it (the queued
  // hero question) re-run when a reply finishes, not on every streamed token.
  const send = useCallback((text: string) => {
    const t = text.trim();
    if (!t || busy) return false;
    clearError();
    sendMessage({ text: t });
    return true;
  }, [busy, clearError, sendMessage]);
  const reset = () => {
    setMessages([]);
    setSessionId(crypto.randomUUID());
    safeStorage(() => localStorage.removeItem(msgsKey), undefined);
  };
  return { messages, status, error, busy, send, reset, ready: Boolean(sessionId) };
}

/** Renders one message's parts (text, tool progress, lead confirmation). */
export function MessageView({ m }: { m: UIMessage }) {
  return (
    <>
      {m.parts.map((part, i) => {
        if (part.type === "text" && part.text.trim()) {
          return <Bubble key={i} role={m.role}>{m.role === "assistant" ? renderMarkdown(part.text) : part.text}</Bubble>;
        }
        if (part.type === "tool-searchProjects" && part.state !== "output-available" && part.state !== "output-error") {
          return <Status key={i}>Searching the portfolio…</Status>;
        }
        if (part.type === "tool-captureLead" && part.state === "output-available") {
          const out = part.output as { saved?: boolean; whatsapp?: string | null };
          if (!out?.saved) return null;
          return (
            <div key={i} className="rounded-[var(--radius)] border border-primary/40 bg-primary/10 p-3 text-sm">
              Your details are with an advisor — expect a reply shortly.
              {out.whatsapp && <a href={out.whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary mt-2 w-full !py-2">Continue on WhatsApp</a>}
            </div>
          );
        }
        return null;
      })}
    </>
  );
}

export function ChatError({ error }: { error: Error }) {
  return <div role="alert" className="rounded-[var(--radius)] border border-red-500/40 bg-red-500/10 p-3 text-sm">{errorText(error)}</div>;
}

export function ChatPanel({ assistantName, greeting, storageKey, suggestions = DEFAULT_SUGGESTIONS, onClose, initialQuestion, onQuestionSent }: ChatProps & {
  onClose?: () => void; initialQuestion?: string; onQuestionSent?: () => void;
}) {
  const { messages, status, error, busy, send, reset, ready } = useConciergeChat(storageKey);
  // A question handed over by the hero box is sent once the session is ready and the concierge is
  // not mid-reply; while busy it waits, and `send` changing when the reply ends retries it once.
  useEffect(() => {
    if (initialQuestion && ready && !busy && send(initialQuestion)) onQuestionSent?.();
  }, [initialQuestion, ready, busy, send, onQuestionSent]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  // Braces matter: newer browsers return a Promise from scrollIntoView, which React would treat as a cleanup.
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, status]);
  const submit = (t: string) => { if (send(t)) setInput(""); };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Sparkles size={16} /></span>
          <div>
            <p className="font-heading leading-tight">{assistantName}</p>
            <p className="text-xs text-muted-foreground">AI concierge · replies instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={reset} className="rounded p-2 text-muted-foreground hover:text-foreground" aria-label="New conversation" title="New conversation"><RotateCcw size={16} /></button>
          )}
          {onClose && <button onClick={onClose} className="rounded p-2 text-muted-foreground hover:text-foreground" aria-label="Close chat"><X size={18} /></button>}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <Bubble role="assistant">{renderMarkdown(greeting)}</Bubble>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((s) => (
              <button key={s} onClick={() => submit(s)} className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary">{s}</button>
            ))}
          </div>
        )}
        {messages.map((m) => <MessageView key={m.id} m={m} />)}
        {status === "submitted" && <Status>Thinking…</Status>}
        {error && <ChatError error={error} />}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(input); }} className="flex items-end gap-2 border-t p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); } }}
          rows={1}
          maxLength={2000}
          placeholder="Ask about projects, prices, payment plans…"
          className="input max-h-32 min-h-[44px] flex-1 resize-none"
          aria-label="Message"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary !h-11 !w-11 !p-0" aria-label="Send">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, children }: { role: string; children: ReactNode }) {
  const mine = role === "user";
  return (
    <div className={cn("flex", mine && "justify-end")}>
      <div className={cn(
        "prose-chat max-w-[85%] whitespace-pre-wrap rounded-[calc(var(--radius)+4px)] px-3.5 py-2.5 text-[0.95rem] leading-relaxed",
        mine ? "bubble-user bg-primary text-primary-foreground" : "bubble-assistant bg-muted",
      )}>
        {children}
      </div>
    </div>
  );
}

export function Status({ children }: { children: ReactNode }) {
  return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 size={14} className="animate-spin" />{children}</p>;
}

function errorText(error: Error) {
  try {
    const parsed = JSON.parse(error.message);
    if (parsed?.error) return parsed.error as string;
  } catch {}
  return "Sorry, I couldn't respond just now. Please try again in a moment or use the contact form.";
}

// Minimal, safe markdown: links, **bold**, and "- " bullets. No HTML is ever injected.
function renderMarkdown(text: string): ReactNode {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={`ul${out.length}`}>{list}</ul>); list = []; } };
  lines.forEach((line, i) => {
    const m = line.match(/^\s*[-*•]\s+(.*)/);
    if (m) list.push(<li key={i}>{inline(m[1])}</li>);
    else { flush(); out.push(<Fragment key={i}>{inline(line)}{i < lines.length - 1 ? "\n" : ""}</Fragment>); }
  });
  flush();
  return out;
}

function inline(s: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    if (m[1]) {
      const href = m[2];
      if (href.startsWith("/")) parts.push(<Link key={m.index} href={href}>{m[1]}</Link>);
      else if (/^https?:\/\//.test(href)) parts.push(<a key={m.index} href={href} target="_blank" rel="noreferrer nofollow">{m[1]}</a>);
      else parts.push(m[1]);
    } else parts.push(<strong key={m.index}>{m[3]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}
