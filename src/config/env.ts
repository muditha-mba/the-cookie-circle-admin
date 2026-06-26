/**
 * Validated environment configuration for the Admin Panel.
 * Only NEXT_PUBLIC_* variables are available in the browser.
 *
 * IMPORTANT: use direct `process.env.NEXT_PUBLIC_*` access so Next.js can
 * inline values into the client bundle at build time. Dynamic lookups like
 * `process.env[name]` are NOT replaced and break Vercel deployments.
 */

export type AppEnv = "development" | "staging" | "production";

const APP_ENV_VALUES: AppEnv[] = ["development", "staging", "production"];

function resolveEnv(
  value: string | undefined,
  name: string,
  fallback?: string,
): string {
  const resolved = (value ?? fallback)?.trim();
  if (!resolved) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return resolved;
}

function parseAppEnv(value: string | undefined): AppEnv {
  if (value && APP_ENV_VALUES.includes(value as AppEnv)) {
    return value as AppEnv;
  }
  return "development";
}

const appEnv = parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV);

const apiUrl = resolveEnv(
  process.env.NEXT_PUBLIC_API_URL,
  "NEXT_PUBLIC_API_URL",
  appEnv === "development" ? "http://localhost:8000" : undefined,
);
const appUrl = resolveEnv(
  process.env.NEXT_PUBLIC_APP_URL,
  "NEXT_PUBLIC_APP_URL",
  appEnv === "development" ? "http://localhost:3001" : undefined,
);

if (
  (appEnv === "staging" || appEnv === "production") &&
  (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1"))
) {
  throw new Error(
    `NEXT_PUBLIC_API_URL must be a public HTTPS URL when NEXT_PUBLIC_APP_ENV=${appEnv}`,
  );
}

export const env = {
  appEnv,
  appName: resolveEnv(
    process.env.NEXT_PUBLIC_APP_NAME,
    "NEXT_PUBLIC_APP_NAME",
    "The Cookie Circle Admin",
  ),
  appUrl,
  apiUrl,
  isDevelopment: appEnv === "development",
  isStaging: appEnv === "staging",
  isProduction: appEnv === "production",
} as const;
