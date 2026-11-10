"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createSite } from "./actions";
import { PRESETS } from "@/lib/theme";

/** Starting looks offered at sign-up: a template plus a colour preset. */
const LOOKS = ([
  ["classic", "calm-green", "Classic · green"],
  ["classic", "classic-navy", "Classic · navy"],
  ["lounge", "luxury-gold", "Lounge · gold"],
] as const).map(([tpl, preset, label]) => {
  const t = PRESETS[preset].tokens;
  return { value: `${tpl}:${preset}`, label, bg: t.background, primary: t.primary, muted: t.muted };
});

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
      <form key="account" onSubmit={signUp} className="grid gap-5">
        <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
        <label className="field"><span>Password</span><input name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
        {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
        <button className="a-btn a-btn-primary !min-h-[3.25rem] text-base" disabled={busy}>{busy ? "Creating account…" : "Continue"}</button>
      </form>
    );
  }

  return (
    <form key="site" action={action} className="grid gap-5">
      <label className="field"><span>Business name</span>
        <input name="name" required value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} placeholder="e.g. Aurelia Estates" />
      </label>
      <div className="field">
        <label htmlFor="slug" className="font-semibold">Site address</label>
        <div className="flex items-stretch overflow-hidden rounded-[0.625rem] border border-[#b4bcc9] bg-white focus-within:outline focus-within:outline-2 focus-within:outline-[#1e46b8]">
          <input id="slug" name="slug" required value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} className="min-w-0 flex-1 !border-0 !outline-none" aria-describedby="slug-help" />
          <span className="flex items-center border-l bg-slate-50 px-3 text-sm text-slate-600">.{rootDomain}</span>
        </div>
        <small id="slug-help">You can connect your own domain later.</small>
      </div>
      <fieldset className="grid gap-2.5">
        <legend className="mb-2.5 text-sm font-semibold">Starting template</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LOOKS.map((l, i) => (
            <label key={l.value} className="flex cursor-pointer flex-col gap-2.5 rounded-xl border border-[#b4bcc9] p-3 has-[:checked]:border-2 has-[:checked]:border-[#1e46b8] has-[:checked]:bg-blue-50/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#1e46b8]">
              <span aria-hidden className="flex h-14 items-end gap-1.5 rounded-lg border p-2" style={{ background: l.bg }}>
                <span className="h-2.5 w-7 rounded" style={{ background: l.primary }} /><span className="h-2.5 w-11 rounded" style={{ background: l.muted }} />
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input type="radio" name="look" value={l.value} defaultChecked={i === 0} className="h-4 w-4 accent-[#1e46b8]" />{l.label}
              </span>
            </label>
          ))}
        </div>
        <small className="text-sm text-slate-600">You can switch template and colours any time, and preview before publishing.</small>
      </fieldset>
      {state?.error && <p role="alert" className="text-sm font-medium text-red-700">{state.error}</p>}
      <button className="a-btn a-btn-primary !min-h-[3.25rem] text-base" disabled={pending}>{pending ? "Creating your site…" : "Create my site"}</button>
      <p className="text-sm text-slate-600">Your site starts with sample content so it never looks empty. Replace it at your own pace.</p>
    </form>
  );
}
