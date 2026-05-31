import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";

type HeaderProps = {
  title: string;
  description?: string;
};

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6 md:px-10">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 truncate text-sm text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
