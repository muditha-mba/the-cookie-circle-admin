import { FinancialAccessGuard } from "@/components/auth/FinancialAccessGuard";

export default function ProductItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinancialAccessGuard>{children}</FinancialAccessGuard>;
}
