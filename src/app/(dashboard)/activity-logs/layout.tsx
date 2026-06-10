import { FinancialAccessGuard } from "@/components/auth/FinancialAccessGuard";

export default function ActivityLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinancialAccessGuard>{children}</FinancialAccessGuard>;
}
