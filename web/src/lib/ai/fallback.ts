import "server-only";
import type { LanguageModelV4 } from "@ai-sdk/provider";

/**
 * Wraps several models into one: if a call fails before any output (rate limit,
 * quota, outage — common on free tiers), the next model is tried.
 */
export function fallbackModel(models: LanguageModelV4[]): LanguageModelV4 {
  if (models.length === 1) return models[0];
  const first = models[0];
  const attempt = async <T>(fn: (m: LanguageModelV4) => PromiseLike<T>): Promise<T> => {
    let lastErr: unknown;
    for (const m of models) {
      try {
        return await fn(m);
      } catch (err) {
        lastErr = err;
        console.warn(`[ai] ${m.provider}/${m.modelId} failed, trying next:`, (err as Error)?.message ?? err);
      }
    }
    throw lastErr;
  };
  return {
    specificationVersion: "v4",
    provider: "fallback",
    modelId: models.map((m) => `${m.provider}:${m.modelId}`).join(","),
    supportedUrls: first.supportedUrls,
    doGenerate: (opts) => attempt((m) => m.doGenerate(opts)),
    doStream: (opts) => attempt((m) => m.doStream(opts)),
  };
}
