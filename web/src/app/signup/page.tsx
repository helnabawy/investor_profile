import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { SignupForm } from "./signup-form";
import { env, isMulti } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Create your site" };

export default async function SignupPage() {
  if (!isMulti) redirect("/login");
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  return (
    <AuthShell title="Launch your real-estate site" subtitle="Portfolio website + AI concierge, ready in a minute.">
      <SignupForm signedIn={!!user} rootDomain={env.rootDomain} />
    </AuthShell>
  );
}
