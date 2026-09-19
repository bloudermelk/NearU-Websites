import Link from "next/link";
import clsx from "clsx";
import { ReactNode } from "react";

type CtaVariant = "primary" | "secondary" | "outline";

export function Cta({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: CtaVariant;
  className?: string;
}) {
  const isExternal = href.startsWith("tel:") || href.startsWith("http");

  const styles = clsx(
    "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors",
    variant === "primary" &&
      "bg-brand-primary text-white hover:bg-brand-primary-active",
    variant === "secondary" &&
      "bg-brand-secondary text-white hover:bg-brand-secondary-active",
    variant === "outline" &&
      "border-2 border-brand-secondary text-brand-secondary hover:bg-brand-gray-light",
    className
  );

  if (isExternal) {
    return (
      <a href={href} className={styles}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={styles}>
      {children}
    </Link>
  );
}
