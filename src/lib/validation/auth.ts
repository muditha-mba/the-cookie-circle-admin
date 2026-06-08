import { z } from "zod";

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export const normalizedEmailSchema = z
  .string()
  .email("Enter a valid email address")
  .transform(normalizeEmail);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a number");

export const loginPasswordSchema = z.string().min(1, "Password is required");
