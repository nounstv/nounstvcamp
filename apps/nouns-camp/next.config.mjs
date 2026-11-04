import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import webpack from "webpack";
import serwist from "@serwist/next";

// `next lint` runs this file
const isLintJob = process.env.CI_LINT != null;

// Assert environment variables are setup correctly
const assertEnvironment = () => {
  // Skip this check in CI lint jobs
  if (isLintJob) return;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const templateFile = readFileSync(path.join(__dirname, ".env.template"));
  const whitelistedKeys = Object.keys(dotenv.parse(templateFile));

  // Assert that required (all whitelisted) variables are defined
  for (const key of whitelistedKeys)
    if (
      key !== "NEXT_PUBLIC_RPC_URL" &&
      !(
        key === "NEXT_PUBLIC_ALCHEMY_API_KEY" &&
        process.env.NEXT_PUBLIC_RPC_URL?.trim()
      ) &&
      process.env[key] == null
    )
      throw new Error(`${key} is not defined`);

  // Assert that any public keys are defined in the whitelist
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_VERCEL_")) continue; // Variables injected by Vercel are fine
    if (key.startsWith("NEXT_PUBLIC_") && !whitelistedKeys.includes(key))
      throw new Error(`${key} is not allowed`);
  }
};

try {
  assertEnvironment();
} catch (e) {
  if (process.env.NODE_ENV === "production") throw e;
  console.warn("Incomplete environment", e);
}

const withSerwist = serwist({
  swSrc: "src/app/service-worker.js",
  swDest: "public/service-worker.js",
  swUrl: "/service-worker.js",
  disable: process.env.NODE_ENV !== "production",
});

const BUILD_ID = (() => {
  if (process.env.VERCEL_GIT_COMMIT_SHA != null)
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
})();
const APP_HOST = (() => {
  if (process.env.APP_HOST != null) return process.env.APP_HOST;
  if (process.env.VERCEL == null && !isLintJob)
    throw new Error("`APP_HOST` not set");
  return {
    production: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    preview: process.env.VERCEL_BRANCH_URL,
  }[process.env.VERCEL_ENV];
})();
const APP_PRODUCTION_URL = (() => {
  if (process.env.APP_PRODUCTION_URL != null)
    return process.env.APP_PRODUCTION_URL;
  if (process.env.VERCEL == null) return `https://${APP_HOST}`;
  return process.env.VERCEL_PROJECT_PRODUCTION_URL;
})();

const ignoredModules = [
  // @nouns/sdk
  "fs",
  // wagmi / @walletconnect
  "pino-pretty",
  // wagmi / @metamask
  "encoding",
];

export default withSerwist({
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  rewrites() {
    // Subgraphs sem URL configurada não geram rewrite
    const subgraphRewrites = [
      ["/subgraphs/nouns", process.env.NOUNS_SUBGRAPH_URL],
      ["/subgraphs/propdates", process.env.PROPDATES_SUBGRAPH_URL],
    ]
      .filter(([, destination]) => destination?.trim())
      .map(([source, destination]) => ({ source, destination }));

    return [
      { source: "/topics/:path*", destination: "/candidates/:path*" },
      { source: "/sw.js", destination: "/service-worker.js" },
      ...subgraphRewrites,
    ];
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "x-camp-build-id", value: BUILD_ID }],
      },
    ];
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      ...Object.fromEntries(ignoredModules.map((m) => [m, false])),
    };

    config.plugins = [
      ...config.plugins,
      new webpack.DefinePlugin({
        "process.env.BUILD_ID": JSON.stringify(BUILD_ID),
        "process.env.APP_HOST": JSON.stringify(APP_HOST),
        "process.env.APP_PRODUCTION_URL": JSON.stringify(APP_PRODUCTION_URL),
      }),
    ];

    return config;
  },
  turbopack: {
    // Ignoring modules is not a thing yet
    resolveAlias: Object.fromEntries(
      ignoredModules.map((n) => [
        n,
        { browser: "@shades/common/empty-module" },
      ]),
    ),
  },
});
