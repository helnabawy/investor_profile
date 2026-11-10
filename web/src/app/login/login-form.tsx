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
    if (error) return setError(error.message);
    router.push("/admin");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
      <label className="field"><span>Password</span><input name="password" type="password" required autoComplete="current-password" /></label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="a-btn a-btn-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      {allowSignup && <p className="text-center text-sm text-slate-500">New here? <Link href="/signup" className="text-blue-700 underline">Create your site</Link></p>}
    </form>
  );
}
