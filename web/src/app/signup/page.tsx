import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { SignupForm } from "./signup-form";
import { env, isMulti } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Create your site" };

const NEXT = [
  ["Your site goes live straight away", "At the address you chose, with your name and starting template."],
  ["You land in your dashboard", "A short checklist walks you through projects, contact details and the concierge."],
  ["Share the link with buyers", "Enquiries and concierge conversations arrive in your leads inbox."],
];

export default async function SignupPage() {
  if (!isMulti) redirect("/login");
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  return (
    <AuthShell
      title="Create your site"
      subtitle={user ? "A few details and one choice. You can change everything later." : "Start with your email. It takes about a minute."}
      aside={
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold">What happens next</h2>
          <ol className="flex flex-col gap-5">
            {NEXT.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${i === 0 ? "bg-[#1e46b8] text-white" : "bg-blue-50 text-blue-900"}`}>{i + 1}</span>
                <span><span className="block font-semibold">{title}</span><span className="block text-[0.95rem] text-slate-600">{body}</span></span>
              </li>
            ))}
          </ol>
          <a href={`http://demo.${env.rootDomain}`} className="inline-flex min-h-11 items-center font-semibold text-blue-700 hover:text-blue-900">See what a finished site looks like</a>
        </div>
      }
    >
      <SignupForm signedIn={!!user} rootDomain={env.rootDomain} />
    </AuthShell>
  );
}
