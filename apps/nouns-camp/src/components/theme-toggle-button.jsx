"use client";

import React from "react";
import Button from "@shades/ui-web/button";
import { useMatchMedia } from "@shades/common/react";
import useSetting from "@/hooks/setting";

const SunIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

// Alterna claro/escuro direto na barra. A opção "system" continua
// disponível em Settings; aqui o clique sempre fixa o tema oposto ao atual.
const ThemeToggleButton = React.forwardRef((props, ref) => {
  const [themePreference, setThemePreference] = useSetting("theme");
  const systemPrefersDark = useMatchMedia("(prefers-color-scheme: dark)");
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const resolvedTheme =
    themePreference === "system" || themePreference == null
      ? systemPrefersDark
        ? "dark"
        : "light"
      : themePreference;

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const label =
    nextTheme === "dark" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <Button
      ref={ref}
      aria-label={label}
      title={label}
      {...props}
      onClick={() => setThemePreference(nextTheme)}
      style={{ padding: "0 0.6rem", ...props.style }}
    >
      {/* Antes da hidratação o tema ainda não é conhecido: ícone neutro */}
      {!isClient ? (
        <span style={{ display: "inline-block", width: "1.6rem" }} />
      ) : resolvedTheme === "dark" ? (
        <SunIcon
          style={{ width: "1.6rem", height: "auto", display: "block" }}
        />
      ) : (
        <MoonIcon
          style={{ width: "1.6rem", height: "auto", display: "block" }}
        />
      )}
    </Button>
  );
});

ThemeToggleButton.displayName = "ThemeToggleButton";

export default ThemeToggleButton;
