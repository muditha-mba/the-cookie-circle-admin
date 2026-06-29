import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-secondary">Loading...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
