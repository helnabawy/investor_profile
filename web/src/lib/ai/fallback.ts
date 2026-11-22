import "server-only";
import type { LanguageModelV4, LanguageModelV4CallOptions, LanguageModelV4StreamPart, LanguageModelV4StreamResult } from "@ai-sdk/provider";

/** How long one model may take to start answering before the next one is tried. */
const FIRST_OUTPUT_MS = 12_000;

/** Parts a provider sends before any real output; they don't show that the model is answering. */
const PREAMBLE = new Set(["stream-start", "response-metadata", "ping", "raw"]);

/**
 * Wraps several models into one. A model is skipped for the next when it fails before any output:
 * an error (rate limit, quota, outage, overload, common on free tiers), an error as its first
 * streamed part, or no output at all within FIRST_OUTPUT_MS (a stuck or overloaded model, which
 * otherwise holds the request until the platform kills it).
 */
export function fallbackModel(models: LanguageModelV4[]): LanguageModelV4 {
  if (models.length === 1) return models[0];
  const first = models[0];
  const label = (m: LanguageModelV4) => `${m.provider}/${m.modelId}`;

  const generate = async (opts: LanguageModelV4CallOptions) => {
    let lastErr: unknown;
    for (const m of models) {
      try {
        return await m.doGenerate(opts);
      } catch (err) {
        lastErr = err;
        console.warn(`[ai] ${label(m)} failed, trying next:`, (err as Error)?.message ?? err);
      }
    }
    throw lastErr;
  };

  const stream = async (opts: LanguageModelV4CallOptions) => {
    let lastErr: unknown;
    for (const [i, m] of models.entries()) {
      if (opts.abortSignal?.aborted) break;
      try {
        // The last model gets the whole remaining time; earlier ones must start answering promptly.
        return await streamStarted(m, opts, i < models.length - 1 ? FIRST_OUTPUT_MS : undefined);
      } catch (err) {
        lastErr = err;
        console.warn(`[ai] ${label(m)} failed, trying next:`, (err as Error)?.message ?? err);
      }
    }
    throw lastErr ?? new Error("Request aborted");
  };

  return {
    specificationVersion: "v4",
    provider: "fallback",
    modelId: models.map((m) => `${m.provider}:${m.modelId}`).join(","),
    supportedUrls: first.supportedUrls,
    doGenerate: generate,
    doStream: stream,
  };
}

/**
 * Starts a stream and waits until it carries real output (text, reasoning, a tool call or the finish),
 * then hands back a stream that replays what was read and continues. Rejects instead when the model
 * errors first or, given `limitMs`, stays silent that long; its own request is cancelled.
 */
async function streamStarted(m: LanguageModelV4, opts: LanguageModelV4CallOptions, limitMs?: number): Promise<LanguageModelV4StreamResult> {
  const ctrl = new AbortController();
  const outer = opts.abortSignal;
  const onOuterAbort = () => ctrl.abort(outer?.reason);
  if (outer?.aborted) onOuterAbort();
  else outer?.addEventListener("abort", onOuterAbort, { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const silent = new Promise<never>((_, reject) => {
    if (limitMs) {
      timer = setTimeout(() => {
        const err = new Error(`${m.provider}/${m.modelId} gave no output within ${limitMs / 1000}s`);
        err.name = "TimeoutError";
        ctrl.abort(err);
        reject(err);
      }, limitMs);
    }
  });

  try {
    const result = await Promise.race([m.doStream({ ...opts, abortSignal: ctrl.signal }), silent]);
    const reader = result.stream.getReader();
    const seen: LanguageModelV4StreamPart[] = [];
    for (;;) {
      const next = await Promise.race([reader.read(), silent]);
      if (next.done) break;
      seen.push(next.value);
      if (next.value.type === "error") {
        reader.cancel().catch(() => {});
        const e = (next.value as { error?: unknown }).error;
        throw e instanceof Error ? e : new Error(typeof e === "string" ? e : JSON.stringify(e));
      }
      if (!PREAMBLE.has(next.value.type)) break;
    }
    clearTimeout(timer);
    // From here the outer signal alone governs the request; the model is answering.
    return {
      ...result,
      stream: new ReadableStream<LanguageModelV4StreamPart>({
        start(c) { for (const part of seen) c.enqueue(part); },
        async pull(c) {
          const { done, value } = await reader.read();
          if (done) c.close(); else c.enqueue(value);
        },
        cancel(reason) { return reader.cancel(reason); },
      }),
    };
  } catch (err) {
    clearTimeout(timer);
    if (!ctrl.signal.aborted) ctrl.abort(err);
    throw err;
  } finally {
    // Keep forwarding the visitor's abort to the chosen model; drop it only if this model was abandoned.
    if (ctrl.signal.aborted && outer) outer.removeEventListener("abort", onOuterAbort);
  }
}
