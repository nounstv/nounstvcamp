import { headers } from "next/headers";
import Script from "next/script";
import { Inter, Londrina_Solid } from "next/font/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { getSession } from "@/utils/session";
import EmotionRootStyleRegistry from "@/app/emotion-style-root-registry";
import { getStateFromCookie as getWagmiStateFromCookie } from "@/wagmi-config";
import metaConfig from "@/metadata-config";
import CacheStoreProvider from "@/cache-store-provider";
import ConfigProvider from "@/config-provider";
import ThemeProvider from "@/theme-provider";
import WagmiProvider from "@/wagmi-provider";
import GlobalStylesWrapper from "@/global-styles-wrapper";
import SessionProvider from "@/session-provider";
import { Provider as StoreProvider } from "@/store";
// MobileDevTools will be lazy-loaded in development and preview deployments
import { lazy, Suspense } from "react";
const MobileDevTools = lazy(() => import("@/components/mobile-devtools"));

import "@/reset.css";
import "@/index.css";

import "@/snow.css";

// Fontes da marca Nouns TV: Londrina Solid para títulos, Inter para o resto.
// Self-hosted pelo next/font (sem request para o Google em runtime).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const londrina = Londrina_Solid({
  subsets: ["latin"],
  weight: ["300", "400", "900"],
  variable: "--font-londrina",
  display: "swap",
});

const title = metaConfig.appTitle;
const description = metaConfig.appDescription;
const url = metaConfig.canonicalAppBasename;

export const metadata = {
  metadataBase: metaConfig.canonicalAppBasename,
  title: {
    template: metaConfig.titleTemplate,
    default: metaConfig.appTitle,
  },
  description,
  alternates: { canonical: metaConfig.canonicalAppBasename },
  openGraph: {
    type: metaConfig.openGraphType,
    siteName: metaConfig.openGraphSiteName,
    title,
    description,
    url,
  },
  twitter: {
    card: metaConfig.twitterCard,
    title,
    description,
    url,
  },
  appleWebApp: {
    title: metaConfig.appTitle,
    statusBarStyle: metaConfig.appleWebAppStatusBarStyle,
  },
};

export const viewport = {
  colorScheme: "light dark",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: metaConfig.viewportLightThemeColor,
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: metaConfig.viewportDarkThemeColor,
    },
  ],
};

const beforeInteractive = () => {
  try {
    const rawThemePreference = localStorage.getItem("ns:settings:theme");
    if (rawThemePreference != null) {
      const themePreference = JSON.parse(rawThemePreference);
      document.documentElement.dataset.theme = themePreference;
    }
  } catch (e) {
    // Ignore
  }
};

// Antes vinha do Vercel Edge Config. Agora é uma lista opcional de endereços
// (separados por vírgula) nas variáveis de ambiente do servidor.
const parseAccountList = (value) =>
  (value ?? "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);

const fetchConfig = async () => ({
  canaryAccounts: parseAccountList(process.env.CAMP_CANARY_ACCOUNTS),
  betaAccounts: parseAccountList(process.env.CAMP_BETA_ACCOUNTS),
});

export default async function RootLayout({ children }) {
  const [session, config] = await Promise.all([getSession(), fetchConfig()]);
  return (
    <html lang="en">
      <body className={`${inter.variable} ${londrina.variable}`}>
        <Script
          id="load-theme"
          strategy="beforeInteractive"
        >{`(${beforeInteractive})()`}</Script>

        <EmotionRootStyleRegistry>
          <ConfigProvider config={config}>
            <CacheStoreProvider>
              <ThemeProvider>
                <GlobalStylesWrapper>
                  <WagmiProvider
                    initialState={getWagmiStateFromCookie(
                      (await headers()).get("cookie"),
                    )}
                  >
                    <SessionProvider
                      initialSession={{ address: session.address }}
                    >
                      <StoreProvider>
                        {children}
                        {(process.env.NODE_ENV === "development" ||
                          process.env.VERCEL_ENV === "preview") && (
                          <Suspense fallback={null}>
                            <MobileDevTools />
                          </Suspense>
                        )}
                      </StoreProvider>
                    </SessionProvider>
                  </WagmiProvider>
                </GlobalStylesWrapper>
              </ThemeProvider>
            </CacheStoreProvider>
          </ConfigProvider>
        </EmotionRootStyleRegistry>
        {/* Vercel Web Analytics (page views). No-op fora da Vercel/produção. */}
        <VercelAnalytics />
      </body>
    </html>
  );
}
