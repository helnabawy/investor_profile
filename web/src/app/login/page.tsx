import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "./login-form";
import { isMulti } from "@/lib/env";
import { adminT } from "@/lib/i18n/admin-server";

export async function generateMetadata() {
  return { title: (await adminT()).t.auth.signInMeta, icons: { icon: "/logo-mark.svg" } };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const a = (await adminT()).t.auth;
  return (
    <AuthShell title={a.signInTitle} subtitle={a.signInSubtitle}>
      {error === "no-site" && (
        <p className="mb-4 rounded-lg bg-warning-soft p-3 text-sm text-warning">{a.noSite}</p>
      )}
      <LoginForm allowSignup={isMulti} />
    </AuthShell>
  );
}
