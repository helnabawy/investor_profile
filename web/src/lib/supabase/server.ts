import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { authCookieName, env, supabaseServerUrl } from "../env";

/** User-scoped client (RLS applies). Use in server components, actions and route handlers. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(supabaseServerUrl, env.supabaseAnonKey, {
    cookieOptions: { name: authCookieName },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there; proxy refreshes the session.
        }
      },
    },
  });
}

/** Anonymous client for public reads (no cookies → cacheable, RLS "public" policies only). */
export function supabasePublic() {
  return createClient(supabaseServerUrl, env.supabaseAnonKey, { auth: { persistSession: false } });
}

/** Service-role client. Bypasses RLS — always filter by tenant_id explicitly. Server only. */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(supabaseServerUrl, key, { auth: { persistSession: false } });
}
