import type { ReactNode } from "react";

/**
 * The theme's "elevated" ACF block wrapper: a rounded, shadowed frame used
 * around hero images, embeds, and image groups.
 */
export function Elevated({
  children,
  className = "content-fullbleed-mobile box-shadow-lg border-radius-lg",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`elevated ${className}`}>
      <div className="acf-innerblocks-container">{children}</div>
    </div>
  );
}
