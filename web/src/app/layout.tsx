import type { Metadata } from "next";
import "./globals.css";
import { THEME_SCRIPT } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "EstateProfile — websites & AI concierge for real-estate agents",
  description: "Launch a beautiful property portfolio site with an AI concierge that captures leads 24/7.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme is set by THEME_SCRIPT before paint (platform surfaces only), so it may differ from the server render.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
