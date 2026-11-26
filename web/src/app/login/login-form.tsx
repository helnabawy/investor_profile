"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAdminT } from "@/components/admin/i18n";

export function LoginForm({ allowSignup }: { allowSignup: boolean }) {
  const router = useRouter();
  const a = useAdminT().t.auth;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) return setError(error.message === "Invalid login credentials" ? a.badCredentials : error.message);
    router.push("/admin");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-[18px]">
      <label className="field"><span>{a.email}</span><input name="email" type="email" dir="ltr" required autoComplete="email" placeholder="you@youragency.com" className="!min-h-12 !text-base" /></label>
      <label className="field"><span>{a.password}</span><input name="password" type="password" dir="ltr" required autoComplete="current-password" className="!min-h-12 !text-base" /></label>
      {error && <p role="alert" className="rounded-lg bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{error}</p>}
      <button className="a-btn a-btn-primary mt-1 !min-h-[50px] !text-base" disabled={busy}>{busy ? a.signingIn : a.signIn}</button>
      {allowSignup && (
        <p className="mt-2 border-t pt-5 text-[0.95rem] text-ink-2">
          {a.newHere} <Link href="/signup" className="a-link underline">{a.createYourSite}</Link>{a.takesMinutes}
        </p>
      )}
    </form>
  );
}
