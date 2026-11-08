import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "./login-form";
import { isMulti } from "@/lib/env";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthShell title="Sign in to your dashboard" subtitle="Manage your site, projects, chatbot and leads.">
      {error === "no-site" && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">This account isn&apos;t linked to the site yet. Ask the site owner to run the setup script.</p>
      )}
      <LoginForm allowSignup={isMulti} />
    </AuthShell>
  );
}
