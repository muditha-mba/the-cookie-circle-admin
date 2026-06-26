/**
 * Validated environment configuration for the Admin Panel.
 * Only NEXT_PUBLIC_* variables are available in the browser.
 */

export type AppEnv = "development" | "staging" | "production";

const APP_ENV_VALUES: AppEnv[] = ["development", "staging", "production"];

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseAppEnv(value: string | undefined): AppEnv {
  if (value && APP_ENV_VALUES.includes(value as AppEnv)) {
    return value as AppEnv;
  }
  return "development";
}

const appEnv = parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV);

const apiUrl = requireEnv(
  "NEXT_PUBLIC_API_URL",
  appEnv === "development" ? "http://localhost:8000" : undefined,
);
const appUrl = requireEnv(
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
  appName: requireEnv("NEXT_PUBLIC_APP_NAME", "The Cookie Circle Admin"),
  appUrl,
  apiUrl,
  isDevelopment: appEnv === "development",
  isStaging: appEnv === "staging",
  isProduction: appEnv === "production",
} as const;
