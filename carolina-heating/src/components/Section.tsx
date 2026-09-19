import { ReactNode } from "react";
import clsx from "clsx";
import { Container } from "./Container";

export function Section({
  children,
  className,
  containerClassName,
  id,
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("py-12 sm:py-16", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
