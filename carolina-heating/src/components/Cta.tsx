import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/iconSprite";
import { site } from "@/lib/site";

type CtaType = "solid" | "outline" | "outlined";
type CtaLevel = "primary" | "secondary";

export type CtaProps = {
  href?: string;
  children: ReactNode;
  /** Matches the theme's data-cta-type. "outlined" is an alias the original markup uses on service cards. */
  type?: CtaType;
  level?: CtaLevel;
  /** Leading icon (rendered before the label). */
  icon?: IconName;
  /** Trailing icon (rendered after the label), e.g. chevronright on "Learn More". */
  trailingIcon?: IconName;
  minWidth?: boolean;
  gap?: "none" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
  target?: string;
  /**
   * When true, renders the original "Schedule Now" button. The live site opens a
   * ServiceTitan scheduler modal via `_scheduler.show(...)`; until that widget
   * is wired up we route to the bookings page instead.
   */
  schedule?: boolean;
};

export function Cta({
  href,
  children,
  type = "solid",
  level = "primary",
  icon,
  trailingIcon,
  minWidth = true,
  gap = "md",
  className,
  ariaLabel,
  target,
  schedule = false,
}: CtaProps) {
  const classes = ["cta", schedule ? "se-widget-button" : null, className]
    .filter(Boolean)
    .join(" ");

  const dataAttrs: Record<string, string> = {
    "data-cta-gap": gap,
    "data-cta-type": type,
    "data-cta-content": "mixed",
    "data-cta-minwidth": minWidth ? "true" : "false",
  };
  if (type === "solid") {
    dataAttrs["data-cta-level"] = level;
  }

  const inner = (
    <>
      {icon && <Icon name={icon} className="cta-icon" />}
      <span>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} className="cta-icon" />}
    </>
  );

  const resolvedHref = schedule ? site.business.scheduleUrl : href ?? "#";
  const isExternal =
    resolvedHref.startsWith("tel:") ||
    resolvedHref.startsWith("mailto:") ||
    resolvedHref.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={resolvedHref}
        className={classes}
        aria-label={ariaLabel}
        target={target}
        rel={target === "_blank" ? "noreferrer" : undefined}
        {...dataAttrs}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={resolvedHref} className={classes} aria-label={ariaLabel} {...dataAttrs}>
      {inner}
    </Link>
  );
}
