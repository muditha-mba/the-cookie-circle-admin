"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { routes } from "@/config/routes";
import { authApi } from "@/lib/api/auth";
import { normalizedEmailSchema } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { appToast } from "@/lib/toast";
import { notifyActionError } from "@/lib/forms/feedback";

const forgotPasswordSchema = z.object({
  email: normalizedEmailSchema,
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setMessage(null);
    try {
      const response = await authApi.forgotPassword({ email: values.email });
      setMessage(response.message);
      appToast.info(response.message);
    } catch (err) {
      notifyActionError(err, "Unable to process request.", setError);
    }
  });

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-primary">
          Forgot password
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your admin email and we&apos;ll send a reset link.
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
            className={cn(
              "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
              "text-text-primary placeholder:text-text-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info",
            )}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-danger">{errors.email.message}</p>
          ) : null}
        </div>

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-md bg-text-primary px-4 py-2 text-sm font-medium text-background",
            "transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-text-secondary">
        <Link
          href={routes.auth.login}
          className="text-text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
