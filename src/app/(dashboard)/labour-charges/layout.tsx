import { FinancialAccessGuard } from "@/components/auth/FinancialAccessGuard";

export default function LabourChargesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinancialAccessGuard>{children}</FinancialAccessGuard>;
}
