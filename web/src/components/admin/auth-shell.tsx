import Link from "next/link";
import { Home } from "lucide-react";

export function AuthShell({ title, subtitle, children, aside }: { title: string; subtitle?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="admin flex min-h-screen flex-col bg-[#f6f7f9] text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-3">
          <Link href="/" className="flex min-h-11 items-center gap-2.5 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e46b8] text-white"><Home size={18} aria-hidden /></span>
            EstateSite
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-wrap items-start justify-center gap-x-16 gap-y-10 px-5 py-12 md:py-16">
        <div className="w-full max-w-lg rounded-2xl border bg-white p-7 shadow-[0_12px_32px_rgba(16,24,40,0.07)] md:p-9">
          <h1 className="text-[1.75rem] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-slate-600">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
        {aside && <div className="w-full max-w-sm pt-2">{aside}</div>}
      </main>
    </div>
  );
}
