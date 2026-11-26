import "server-only";
import { siteLocale } from "../tenant";
import { SITE } from "./site";

/** The site's words in the current page's language, with that language. */
export async function siteT() {
  const locale = await siteLocale();
  return { t: SITE[locale], locale };
}
