import { Geist } from "next/font/google";

/** UI face for the platform surfaces (landing, sign-in, admin). Tenant sites load their own fonts. */
export const platformFont = Geist({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-platform", display: "swap" });
