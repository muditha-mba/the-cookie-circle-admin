import { FinancialAccessGuard } from "@/components/auth/FinancialAccessGuard";

export default function BusinessSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinancialAccessGuard>{children}</FinancialAccessGuard>;
}
