import { Geist, IBM_Plex_Sans_Arabic } from "next/font/google";

/** UI face for the platform surfaces (landing, sign-in, admin). Tenant sites load their own fonts. */
export const platformFont = Geist({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-platform", display: "swap" });

/** Arabic face for the dashboard in Arabic; Geist keeps Latin text (see --font-platform-ar in globals.css). */
export const platformArabicFont = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], variable: "--font-platform-ar", display: "swap" });
