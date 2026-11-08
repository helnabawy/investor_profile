"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createSite } from "./actions";
import { PRESETS } from "@/lib/theme";

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export function SignupForm({ signedIn, rootDomain }: { signedIn: boolean; rootDomain: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "site" | "verify">(signedIn ? "site" : "account");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [state, action, pending] = useActionState(createSite, null);

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const { data, error } = await supabaseBrowser().auth.signUp({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) return setError(error.message);
    if (!data.session) return setStep("verify"); // email confirmation enabled
    router.refresh();
    setStep("site");
  }

  if (step === "verify") return <p className="text-sm text-slate-600">Check your inbox to confirm your email, then sign in to finish creating your site.</p>;

  if (step === "account") {
    return (
      <form onSubmit={signUp} className="grid gap-4">
        <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
        <label className="field"><span>Password</span><input name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="a-btn a-btn-primary" disabled={busy}>{busy ? "Creating account…" : "Continue"}</button>
      </form>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <label className="field"><span>Business name</span>
        <input name="name" required value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} placeholder="e.g. Aurelia Estates" />
      </label>
      <label className="field"><span>Web address</span>
        <div className="flex items-center gap-1">
          <input name="slug" required value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} className="flex-1" />
          <span className="text-sm text-slate-500">.{rootDomain}</span>
        </div>
      </label>
      <fieldset className="field"><span>Style</span>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PRESETS).map(([id, p], i) => (
            <label key={id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm has-[:checked]:border-teal-600 has-[:checked]:ring-1 has-[:checked]:ring-teal-600">
              <input type="radio" name="preset" value={id} defaultChecked={i === 0} className="sr-only" />
              <span className="h-5 w-5 rounded-full border" style={{ background: `linear-gradient(135deg, ${p.tokens.background} 50%, ${p.tokens.primary} 50%)` }} />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="a-btn a-btn-primary" disabled={pending}>{pending ? "Creating your site…" : "Create my site"}</button>
    </form>
  );
}
