import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { SignupForm } from "./signup-form";
import { env, isMulti, subdomainUrl } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Create your site", icons: { icon: "/logo-mark.svg" } };

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
        <div className="flex flex-col gap-5 border-t pt-7">
          <h2 className="text-lg font-semibold">What happens next</h2>
          <ol className="flex flex-col gap-4">
            {NEXT.map(([title, body], i) => (
              <li key={title} className="flex gap-3.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${i === 0 ? "bg-[#1e46b8] text-white" : "bg-[#e6ecfb] text-[#16348c]"}`}>{i + 1}</span>
                <span><span className="block font-medium">{title}</span><span className="a-muted block text-[0.95rem]">{body}</span></span>
              </li>
            ))}
          </ol>
          <a href={subdomainUrl("demo")} className="a-link inline-flex min-h-11 items-center self-start">See what a finished site looks like</a>
        </div>
      }
    >
      <SignupForm signedIn={!!user} rootDomain={env.rootDomain} />
    </AuthShell>
  );
}
