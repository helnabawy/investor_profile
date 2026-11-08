import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Per-tenant chatbot settings, stored in tenants.ai_config.
 * API keys are NEVER stored here — they come from server env, so a SaaS operator
 * pays one bill and a self-hosted client brings their own keys via .env.
 */
export type AiConfig = {
  provider?: ProviderId | "auto";
  model?: string;
  assistantName?: string;
  greeting?: string;
  instructions?: string; // extra persona / business rules written by the agent
  temperature?: number;
  enabled?: boolean;
  /** Quick-question chips shown under the chat (lounge home, widget). */
  suggestions?: string[];
};

export type ProviderId = "google" | "groq" | "openrouter" | "anthropic";

export const PROVIDERS: Record<ProviderId, { label: string; envKey: string; defaultModel: string; note: string }> = {
  google: { label: "Google Gemini", envKey: "GOOGLE_GENERATIVE_AI_API_KEY", defaultModel: "gemini-flash-latest", note: "Free tier available" },
  groq: { label: "Groq (Llama / open models)", envKey: "GROQ_API_KEY", defaultModel: "llama-3.3-70b-versatile", note: "Free tier, very fast" },
  openrouter: { label: "OpenRouter", envKey: "OPENROUTER_API_KEY", defaultModel: "meta-llama/llama-3.3-70b-instruct", note: "Many cheap & free models" },
  anthropic: { label: "Anthropic Claude", envKey: "ANTHROPIC_API_KEY", defaultModel: "claude-haiku-5-5", note: "Low cost, highest quality" },
};

// Order used by provider "auto": cheapest/free first.
const AUTO_ORDER: ProviderId[] = ["google", "groq", "openrouter", "anthropic"];

// Accepted alternative env names (e.g. the common GEMINI_API_KEY).
const ALIASES: Partial<Record<ProviderId, string[]>> = { google: ["GEMINI_API_KEY"] };

export function providerKey(p: ProviderId): string | undefined {
  return [PROVIDERS[p].envKey, ...(ALIASES[p] ?? [])].map((k) => process.env[k]).find(Boolean);
}

export function availableProviders(): ProviderId[] {
  return AUTO_ORDER.filter((p) => !!providerKey(p));
}

function build(provider: ProviderId, modelId: string) {
  const apiKey = providerKey(provider);
  switch (provider) {
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
    case "groq":
      return createGroq({ apiKey })(modelId);
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "openrouter":
      return createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey }).chatModel(modelId);
  }
}

/**
 * Returns the ordered list of models to try: the tenant's choice first, then any other
 * configured provider as fallback (free tiers rate-limit, so a fallback keeps the bot up).
 */
export function resolveModels(cfg: AiConfig) {
  const available = availableProviders();
  const chosen = cfg.provider && cfg.provider !== "auto" && available.includes(cfg.provider) ? cfg.provider : undefined;
  const order = chosen ? [chosen, ...available.filter((p) => p !== chosen)] : available;
  return order.map((p) => ({
    provider: p,
    modelId: p === chosen && cfg.model ? cfg.model : PROVIDERS[p].defaultModel,
    model: build(p, p === chosen && cfg.model ? cfg.model : PROVIDERS[p].defaultModel),
  }));
}
