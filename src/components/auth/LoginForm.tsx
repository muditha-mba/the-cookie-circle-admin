"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PasswordInput } from "@/components/ui/PasswordInput";
import { routes } from "@/config/routes";
import { useAuth } from "@/providers/AuthProvider";
import {
  loginPasswordSchema,
  normalizedEmailSchema,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { notifyActionError } from "@/lib/forms/feedback";

const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: loginPasswordSchema,
});

type LoginFormValues = z.infer<typeof loginSchema>;

const inputClassName = cn(
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
  "text-text-primary placeholder:text-text-muted",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info",
);

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values.email, values.password);
    } catch (err) {
      notifyActionError(err, "Unable to sign in. Please try again.", setError);
    }
  });

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-primary">Sign in</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Access The Cookie Circle admin dashboard.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClassName}
            placeholder="admin@thecookiecircle.lk"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-danger">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-text-primary"
          >
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            className={inputClassName}
            placeholder="Enter your password"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-danger">{errors.password.message}</p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-md bg-text-primary px-4 py-2 text-sm font-medium text-background",
            "transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-text-secondary">
        <Link
          href={routes.auth.forgotPassword}
          className="text-text-primary underline-offset-4 hover:underline"
        >
          Forgot your password?
        </Link>
      </p>
    </div>
  );
}
