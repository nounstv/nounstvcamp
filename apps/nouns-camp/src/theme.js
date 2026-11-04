import { light as lightTheme, dark as darkTheme } from "@shades/ui-web/theme";

// Identidade Nouns TV sobre o design system do Camp (@shades/ui-web):
// - Londrina Solid em títulos, Inter no resto (variáveis vindas do next/font em app/layout.jsx)
// - vermelho da marca (#e40536) como cor primária, sem azul em foco/links
// - fundo escuro alinhado ao news.nounstv.com (#0a0a0a)

const BRAND_HUE = 347;

const brand = ({ saturation = 0.96, lightness = 0.46, opacity = 1 } = {}) =>
  `hsl(${BRAND_HUE} ${saturation * 100}% ${lightness * 100}% / ${opacity * 100}%)`;

const fontStacks = {
  default:
    'var(--font-inter), Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headers:
    'var(--font-londrina), "Londrina Solid", Inter, system-ui, -apple-system, sans-serif',
  monospace:
    '"SFMono-Regular", Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace',
};

const withBrand = (
  base,
  { primary, primaryHover, textPrimary, textPrimaryHover, selected, extra },
) => ({
  ...base,
  fontStacks,
  text: { ...base.text, fontStacks },
  colors: {
    ...base.colors,
    primary,
    primaryModifierHover: primaryHover,
    primaryTransparent: brand({ opacity: 0.4 }),
    primaryTransparentSoft: brand({ opacity: 0.15 }),
    primaryTransparentStrong: brand({ opacity: 0.6 }),
    textPrimary,
    textPrimaryModifierHover: textPrimaryHover,
    link: textPrimary,
    linkModifierHover: textPrimaryHover,
    backgroundModifierSelected: selected,
    messageBackgroundModifierHighlight: selected,
    mentionFocusBorder: primary,
    ...extra,
  },
  shadows: {
    ...base.shadows,
    focus: `0 0 0 0.1rem ${primary}, 0 0 0 0.3rem ${brand({ opacity: 0.4 })}`,
    focusSmall: `0 0 0 0.1rem ${primary}, 0 0 0 0.2rem ${brand({ opacity: 0.4 })}`,
  },
});

const themes = {
  light: withBrand(lightTheme, {
    primary: brand(),
    primaryHover: brand({ lightness: 0.4 }),
    textPrimary: brand({ saturation: 0.9, lightness: 0.42 }),
    textPrimaryHover: brand({ saturation: 0.9, lightness: 0.36 }),
    selected: brand({ opacity: 0.12 }),
    extra: {
      textPositive: "#0d924d",
      textNegative: "#d32335",
      textPositiveContrast: "#097045",
      textPositiveContrastBackgroundLight: "#e0f1e1",
      textNegativeContrast: "#aa2a38",
      textNegativeContrastBackgroundLight: "#f2dfdf",
      textSpecialContrast: "#8d519d",
      textSpecialContrastBackgroundLight: "#f2dff7",
      textPrimaryBackgroundLight: "#fde3e8",
    },
  }),
  dark: withBrand(darkTheme, {
    primary: brand({ saturation: 0.9, lightness: 0.5 }),
    primaryHover: brand({ saturation: 0.9, lightness: 0.44 }),
    textPrimary: brand({ saturation: 1, lightness: 0.68 }),
    textPrimaryHover: brand({ saturation: 1, lightness: 0.75 }),
    selected: brand({ opacity: 0.18 }),
    extra: {
      backgroundPrimary: "hsl(0 0% 5%)",
      backgroundSecondary: "hsl(0 0% 8%)",
      backgroundTertiary: "hsl(0 0% 11%)",
      backgroundQuarternary: "hsl(0 0% 15%)",
      dialogBackground: "hsl(0 0% 8%)",
      popoverBackground: "hsl(0 0% 9%)",
      textPositive: "#41b579",
      textNegative: "#f25666",
      textPositiveContrast: "#55c88d",
      textPositiveContrastBackgroundLight: "#2b3b33",
      textNegativeContrast: "#ff7281",
      textNegativeContrastBackgroundLight: "#3f2f32",
      textSpecialContrast: "#d388e6",
      textSpecialContrastBackgroundLight: "#3d2f40",
      textPrimaryBackgroundLight: "#3a2228",
    },
  }),
};

export const getTheme = (key) => {
  const theme = themes[key];
  if (theme == null) throw new Error(key);
  return {
    ...theme,
    sidebarWidth: "40rem",
    navBarHeight: "4.7rem",
  };
};
