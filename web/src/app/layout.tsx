import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EstateSite — websites & AI concierge for real-estate agents",
  description: "Launch a beautiful property portfolio site with an AI concierge that captures leads 24/7.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
