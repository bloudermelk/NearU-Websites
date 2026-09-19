import type { IconName } from "@/lib/iconSprite";

/**
 * Mirrors the theme's inline SVG usage exactly:
 *   <svg class="icon" width="16" height="16" aria-hidden="true"><use xlink:href="#icon-x"/></svg>
 * Extra classes (e.g. "cta-icon", "iconlist-icon has-check-green-color") are
 * appended to match each original call site.
 */
export function Icon({
  name,
  className,
  size = 16,
}: {
  name: IconName;
  className?: string;
  size?: number;
}) {
  const cls = className ? `icon ${className}` : "icon";
  return (
    <svg className={cls} width={size} height={size} aria-hidden="true">
      <use href={`#icon-${name}`} />
    </svg>
  );
}
