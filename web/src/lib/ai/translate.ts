import "server-only";
import { generateText } from "ai";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { resolveModels, type AiConfig } from "./config";
import { fallbackModel } from "./fallback";

export const TRANSLATE_LIMITS = { strings: 80, chars: 24_000, perString: 4_000 };

const INSTRUCTIONS = `You translate website copy for a real-estate agency in the UAE from English into Arabic.
Write natural Modern Standard Arabic as used by Gulf property developers and brokers: clear, warm and professional, never literal.
Keep unchanged: numbers, prices, currency codes (AED, USD), percentages, dates such as "Q4 2027", payment-plan ratios such as "60/40", units (m², sq ft), URLs, email addresses and phone numbers.
Write project, developer, building and community names the way they are known in Arabic in the UAE (e.g. Dubai Marina → دبي مارينا, Emaar → إعمار, Downtown Dubai → وسط مدينة دبي); when there is no known Arabic name, transliterate it.
Keep line breaks. Do not add notes or explanations.
You receive a JSON object of English strings. Reply with only a JSON object with exactly the same keys, each value the Arabic translation.`;

/** Translates a set of strings in one model call. Returns the translations that came back for the given keys. */
export async function translateToArabic(ai: AiConfig, texts: Record<string, string>): Promise<Record<string, string>> {
  const models = resolveModels(ai);
  if (!models.length) throw new Error("no-provider");
  const { text } = await generateText({
    model: fallbackModel(models.map((m) => m.model as LanguageModelV4)),
    instructions: INSTRUCTIONS,
    prompt: JSON.stringify(texts),
    temperature: 0.2,
    maxRetries: models.length > 1 ? 0 : 1,
    timeout: { totalMs: 55_000 },
  });
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const parsed = JSON.parse(json) as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(texts)
      .map((k) => [k, parsed[k]] as const)
      .filter((e): e is readonly [string, string] => typeof e[1] === "string" && e[1].trim() !== "")
      .map(([k, v]) => [k, v.trim()]),
  );
}
