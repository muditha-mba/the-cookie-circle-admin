import { FinancialAccessGuard } from "@/components/auth/FinancialAccessGuard";

export default function UtilityChargesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinancialAccessGuard>{children}</FinancialAccessGuard>;
}
