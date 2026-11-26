import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { isLocale, type Locale } from "./locales";
import { ADMIN } from "./admin";

/** Admin interface language: the ui_lang cookie, passed on by the proxy as x-locale. */
export const adminLocale = cache(async (): Promise<Locale> => {
  const v = (await headers()).get("x-locale");
  return isLocale(v) ? v : "en";
});

export async function adminT() {
  const locale = await adminLocale();
  return { t: ADMIN[locale], locale };
}
