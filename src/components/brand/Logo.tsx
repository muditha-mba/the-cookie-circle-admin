import Image from "next/image";

import { branding } from "@/config/branding";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
};

const SIZES = {
  full: { width: 140, height: 140, className: "h-10 w-auto" },
  mark: { width: 40, height: 40, className: "h-9 w-9" },
} as const;

export function Logo({
  variant = "full",
  className,
  priority = false,
}: LogoProps) {
  const size = SIZES[variant];

  return (
    <Image
      src={branding.logo.main}
      alt={branding.name}
      width={size.width}
      height={size.height}
      priority={priority}
      className={cn(size.className, "object-contain", className)}
    />
  );
}
