"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createSite } from "./actions";
import { PRESETS } from "@/lib/theme";
import { templateFor } from "@/lib/templates";
import { useAdminT } from "@/components/admin/i18n";

/** Starting looks offered at sign-up: a template plus a colour preset. */
const LOOKS = ([
  ["classic", "calm-green"],
  ["classic", "classic-navy"],
  ["lounge", "luxury-gold"],
] as const).map(([tpl, preset]) => {
  const t = PRESETS[preset].tokens;
  return { value: `${tpl}:${preset}`, template: templateFor(tpl).name, preset, bg: t.background, primary: t.primary, muted: t.muted };
});

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export function SignupForm({ signedIn, rootDomain }: { signedIn: boolean; rootDomain: string }) {
  const router = useRouter();
  const a = useAdminT().t.auth;
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

  if (step === "verify") return <p className="text-sm text-ink-3">{a.checkInbox}</p>;

  if (step === "account") {
    return (
      <form key="account" onSubmit={signUp} className="grid gap-5">
        <label className="field"><span>{a.email}</span><input name="email" type="email" dir="ltr" required autoComplete="email" /></label>
        <label className="field"><span>{a.password}</span><input name="password" type="password" dir="ltr" required minLength={8} autoComplete="new-password" /></label>
        {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
        <button className="a-btn a-btn-primary !min-h-[3.25rem] text-base" disabled={busy}>{busy ? a.creatingAccount : a.continue}</button>
      </form>
    );
  }

  return (
    <form key="site" action={action} className="grid gap-5">
      <label className="field"><span>{a.businessName}</span>
        <input name="name" required value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} placeholder={a.businessPh} />
      </label>
      <div className="field">
        <label htmlFor="slug" className="font-semibold">{a.siteAddress}</label>
        <div dir="ltr" className="flex items-stretch overflow-hidden rounded-[0.625rem] border border-line-input bg-surface focus-within:outline focus-within:outline-2 focus-within:outline-brand">
          <input id="slug" name="slug" required value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} className="min-w-0 flex-1 !border-0 !outline-none" aria-describedby="slug-help" />
          <span className="flex items-center border-s bg-subtle px-3 text-sm text-ink-3">.{rootDomain}</span>
        </div>
        <small id="slug-help">{a.ownDomainLater}</small>
      </div>
      <fieldset className="grid gap-2.5">
        <legend className="mb-2.5 text-sm font-semibold">{a.startingTemplate}</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LOOKS.map((l, i) => (
            <label key={l.value} className="flex cursor-pointer flex-col gap-2.5 rounded-xl border border-line-input p-3 has-[:checked]:border-2 has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand">
              <span aria-hidden className="flex h-14 items-end gap-1.5 rounded-lg border p-2" style={{ background: l.bg }}>
                <span className="h-2.5 w-7 rounded" style={{ background: l.primary }} /><span className="h-2.5 w-11 rounded" style={{ background: l.muted }} />
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input type="radio" name="look" value={l.value} defaultChecked={i === 0} className="h-4 w-4 accent-brand" />{l.template} · {a.looks[l.preset]}
              </span>
            </label>
          ))}
        </div>
        <small className="text-sm text-ink-3">{a.switchAnytime}</small>
      </fieldset>
      {state?.error && <p role="alert" className="text-sm font-medium text-danger">{state.error}</p>}
      <button className="a-btn a-btn-primary !min-h-[3.25rem] text-base" disabled={pending}>{pending ? a.creatingSite : a.createMySite}</button>
      <p className="text-sm text-ink-3">{a.sampleContent}</p>
    </form>
  );
}
