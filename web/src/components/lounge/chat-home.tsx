"use client";
import { useEffect, useRef, useState } from "react";
import { LayoutGroup, MotionConfig, motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowUp, Loader2, RotateCcw } from "lucide-react";
import { ChatError, MessageView, Status, useConciergeChat } from "@/components/site/chat";
import { cn } from "@/lib/format";
import { Backdrop } from "./backdrop";

type Props = {
  name: string;
  subtitle: string;
  portraitUrl?: string;
  backdropUrl?: string;
  storageKey: string;
  suggestions: string[];
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Splits "Aurelia Estates" → ["Aurelia", "Estates"] so the last word can carry the accent. */
function splitName(name: string) {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? [words.slice(0, -1).join(" "), words.at(-1)!] : ["", name];
}

function Avatar({ src, name, size }: { src?: string; name: string; size: "lg" | "sm" }) {
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <motion.span
      layoutId="lounge-avatar"
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-[var(--lounge-glass-line)]",
        size === "lg" ? "h-24 w-24 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8)]" : "h-10 w-10",
      )}
      style={{ background: "color-mix(in srgb, var(--primary) 30%, #0b0a08)" }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className={cn("font-heading text-[var(--accent)]", size === "lg" ? "text-3xl" : "text-sm")}>{initials}</span>
      )}
    </motion.span>
  );
}

export function LoungeChatHome({ name, subtitle, portraitUrl, backdropUrl, storageKey, suggestions }: Props) {
  const { messages, status, error, busy, send, reset } = useConciergeChat(storageKey);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduce = useReducedMotion(); // only used in effects (scroll behaviour), never during render
  const talking = messages.length > 0;
  const [first, last] = splitName(name);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, status, reduce]);

  const submit = (text: string) => {
    if (send(text)) {
      setInput("");
      inputRef.current?.focus();
    }
  };

  return (
    <MotionConfig reducedMotion="user">
    <LayoutGroup>
      <section className="on-photo relative isolate flex h-[100dvh] flex-col px-4 pb-5 pt-20 sm:px-8 lg:pt-8">
        <Backdrop src={backdropUrl} />
        {/* Header: the lobby title, which condenses into a bar once the conversation starts. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {talking ? (
            <motion.header
              key="bar"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mx-auto flex w-full max-w-[40rem] items-center gap-3 border-b border-[var(--lounge-glass-line)] pb-4"
            >
              <Avatar src={portraitUrl} name={name} size="sm" />
              <motion.p layoutId="lounge-title" transition={{ duration: 0.6, ease: EASE }} className="font-heading text-lg leading-tight">
                {first} <span className="text-[var(--accent)]">{last}</span>
              </motion.p>
              <button onClick={reset} className="font-ui ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-[var(--lounge-muted)] transition hover:bg-white/10 hover:text-[var(--lounge-text)]">
                <RotateCcw size={13} /> New conversation
              </button>
            </motion.header>
          ) : (
            <motion.div
              key="lobby"
              exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex flex-1 flex-col items-center justify-center pb-6 text-center"
            >
              <Avatar src={portraitUrl} name={name} size="lg" />
              <motion.h1
                layoutId="lounge-title"
                transition={{ duration: 0.6, ease: EASE }}
                className="mt-6 text-balance font-heading text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.05]"
              >
                {first} <span className="text-[var(--accent)]">{last}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                className="muted font-ui mt-3 max-w-[30ch] text-balance text-[0.98rem] leading-relaxed"
              >
                {subtitle}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thread */}
        {talking && (
          <div ref={threadRef} className="lounge-thread -mx-4 min-h-0 flex-1 overflow-y-auto px-4 sm:-mx-8 sm:px-8" aria-live="polite">
            <div className="mx-auto w-full max-w-[40rem] space-y-4 py-6">
              {messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-3">
                  <MessageView m={m} />
                </motion.div>
              ))}
              {status === "submitted" && <div className="muted"><Status>Thinking…</Status></div>}
              {error && <ChatError error={error} />}
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="mx-auto w-full max-w-[40rem]">
          {!talking && (
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } } }}
              className="mb-4 flex flex-wrap justify-center gap-2"
              aria-label="Suggested questions"
            >
              {suggestions.map((s) => (
                <motion.li key={s} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}>
                  <button type="button" onClick={() => submit(s)} className="lounge-chip">{s}</button>
                </motion.li>
              ))}
            </motion.ul>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); submit(input); }}
            className={cn("lounge-composer flex items-end gap-2 p-2.5", talking && "mt-3")}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); } }}
              rows={2}
              maxLength={2000}
              placeholder={talking ? "Reply…" : "Ask about projects, prices…"}
              aria-label="Message"
              className="max-h-40 min-h-[3.25rem] flex-1 resize-none px-2.5 py-2 text-[0.98rem] leading-relaxed outline-none"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="lounge-send flex h-10 w-10 items-center justify-center">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2} />}
            </button>
          </form>
          <p className="muted font-ui mt-2.5 hidden text-center text-[0.72rem] sm:block">Enter to send · Shift + Enter for a new line · Answers come from this advisor&apos;s own portfolio</p>
        </div>
      </section>
    </LayoutGroup>
    </MotionConfig>
  );
}
