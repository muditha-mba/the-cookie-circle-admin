import { Logo } from "@/components/brand/Logo";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { branding } from "@/config/branding";
import { getUpcomingModules } from "@/config/navigation";

export default function DashboardPage() {
  const upcomingModules = getUpcomingModules();

  return (
    <DashboardPageShell
      title="Dashboard"
      description="Overview of your business operations."
    >
      <section className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Logo variant="full" className="h-16 w-16 shrink-0" priority />
            <div className="min-w-0">
              <h2 className="text-base font-medium text-text-primary">
                Welcome to {branding.name} Admin
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                This is your business management dashboard. Management modules
                for products, collections, customers, orders, and analytics will
                be added in upcoming development phases.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {upcomingModules.map((module) => (
            <div
              key={module.id}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <p className="text-sm font-medium text-text-primary">
                {module.title}
              </p>
              <p className="mt-1 text-xs text-text-muted">Coming soon</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardPageShell>
  );
}
