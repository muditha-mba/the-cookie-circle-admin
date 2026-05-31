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

export const env = {
  appEnv,
  appName: requireEnv("NEXT_PUBLIC_APP_NAME", "The Cookie Circle Admin"),
  appUrl: requireEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3001"),
  apiUrl: requireEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000"),
  isDevelopment: appEnv === "development",
  isStaging: appEnv === "staging",
  isProduction: appEnv === "production",
} as const;
