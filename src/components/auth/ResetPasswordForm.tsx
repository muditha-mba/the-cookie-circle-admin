"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PasswordInput } from "@/components/ui/PasswordInput";
import { routes } from "@/config/routes";
import { authApi } from "@/lib/api/auth";
import type { ApiError } from "@/lib/api/types";
import { passwordSchema } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const inputClassName = cn(
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
  "text-text-primary",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info",
);

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    setError(null);
    try {
      await authApi.resetPassword({ token, password: values.password });
      router.replace(routes.auth.login);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to reset password.");
    }
  });

  if (!token) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-danger">
          Reset token is missing or invalid. Please request a new reset link.
        </p>
        <p className="mt-4 text-center text-sm">
          <Link href={routes.auth.forgotPassword} className="underline">
            Request reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-primary">
          Reset password
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choose a new password for your admin account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-text-primary"
          >
            New password
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            className={inputClassName}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-danger">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-text-primary"
          >
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            className={inputClassName}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-danger">
              {errors.confirmPassword.message}
            </p>
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
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}
