import { FinancialAccessGuard } from "@/components/auth/FinancialAccessGuard";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinancialAccessGuard>{children}</FinancialAccessGuard>;
}
