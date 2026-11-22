"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export function LoginForm({ allowSignup }: { allowSignup: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) return setError(error.message === "Invalid login credentials" ? "That email and password don't match. Check both and try again." : error.message);
    router.push("/admin");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-[18px]">
      <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" placeholder="you@youragency.com" className="!min-h-12 !text-base" /></label>
      <label className="field"><span>Password</span><input name="password" type="password" required autoComplete="current-password" className="!min-h-12 !text-base" /></label>
      {error && <p role="alert" className="rounded-lg bg-[#fef3f2] px-3.5 py-2.5 text-sm text-[#b42318]">{error}</p>}
      <button className="a-btn a-btn-primary mt-1 !min-h-[50px] !text-base" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      {allowSignup && (
        <p className="mt-2 border-t pt-5 text-[0.95rem] text-[#3d4658]">
          New here? <Link href="/signup" className="a-link underline">Create your site</Link>. It takes a few minutes and starts free.
        </p>
      )}
    </form>
  );
}
