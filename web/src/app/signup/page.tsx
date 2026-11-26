import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { SignupForm } from "./signup-form";
import { env, isMulti, subdomainUrl } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";
import { adminT } from "@/lib/i18n/admin-server";

export async function generateMetadata() {
  return { title: (await adminT()).t.auth.signupMeta, icons: { icon: "/logo-mark.svg" } };
}

export default async function SignupPage() {
  if (!isMulti) redirect("/login");
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  const a = (await adminT()).t.auth;
  return (
    <AuthShell
      title={a.signupTitle}
      subtitle={user ? a.signupSubSignedIn : a.signupSub}
      aside={
        <div className="flex flex-col gap-5 border-t pt-7">
          <h2 className="text-lg font-semibold">{a.nextTitle}</h2>
          <ol className="flex flex-col gap-4">
            {a.next.map(([title, body], i) => (
              <li key={title} className="flex gap-3.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${i === 0 ? "bg-brand text-white" : "bg-brand-soft text-brand-strong"}`}>{i + 1}</span>
                <span><span className="block font-medium">{title}</span><span className="a-muted block text-[0.95rem]">{body}</span></span>
              </li>
            ))}
          </ol>
          <a href={subdomainUrl("demo")} className="a-link inline-flex min-h-11 items-center self-start">{a.seeDemo}</a>
        </div>
      }
    >
      <SignupForm signedIn={!!user} rootDomain={env.rootDomain} />
    </AuthShell>
  );
}
