"use client";
import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

/**
 * Light / dark for the platform surfaces (landing, sign-in, admin); tenant sites ignore it.
 * No stored choice means "follow the system". A choice is stored and applied before first paint by
 * THEME_SCRIPT in the root layout, as data-theme on <html>.
 */
export type ThemeChoice = "system" | "light" | "dark";
const KEY = "ep-theme";

/** Runs in <head> before the page paints, so a stored choice never flashes the other theme. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

function read(): ThemeChoice {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  // Ease the colours across for the switch itself (a class, so page loads never animate).
  const root = document.documentElement;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 350);
  }
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {}
  if (choice === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
  // Canvas drawings (the hero skyline) re-read their colours on this event.
  window.dispatchEvent(new Event("ep-theme"));
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("ep-theme", onChange);
  return () => window.removeEventListener("ep-theme", onChange);
};

const isDark = () =>
  document.documentElement.dataset.theme === "dark" ||
  (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);

/**
 * `icon`: one button that flips to the other theme (landing app bar). Its icon is chosen in CSS, so the
 * server render is right in either theme. `segmented`: System / Light / Dark (admin sidebar).
 */
type Labels = { theme: string; themeSystem: string; themeLight: string; themeDark: string; themeSwitch: string; themeTitle: string };
const EN_LABELS: Labels = { theme: "Theme", themeSystem: "System", themeLight: "Light", themeDark: "Dark", themeSwitch: "Switch between light and dark theme", themeTitle: "Light or dark" };

export function ThemeToggle({ variant = "icon", className = "", labels = EN_LABELS }: { variant?: "icon" | "segmented"; className?: string; labels?: Labels }) {
  // The stored choice, kept in step with other toggles on the page; "system" on the server.
  const choice = useSyncExternalStore(subscribe, read, () => "system" as ThemeChoice);

  if (variant === "icon") {
    return (
      <button type="button" onClick={() => apply(isDark() ? "light" : "dark")} aria-label={labels.themeSwitch} title={labels.themeTitle} className={`theme-icon-btn ${className}`}>
        <Moon size={19} strokeWidth={1.75} aria-hidden data-show="light" />
        <Sun size={19} strokeWidth={1.75} aria-hidden data-show="dark" />
      </button>
    );
  }

  const opts: [ThemeChoice, string, typeof Sun][] = [["system", labels.themeSystem, Monitor], ["light", labels.themeLight, Sun], ["dark", labels.themeDark, Moon]];
  return (
    <div role="radiogroup" aria-label={labels.theme} className={`theme-seg ${className}`}>
      {opts.map(([id, label, Icon]) => (
        <button key={id} type="button" role="radio" aria-checked={choice === id} title={label}
          onClick={() => apply(id)}>
          <Icon size={15} strokeWidth={1.75} aria-hidden />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
