import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./icons";

/** The signature heading: a script lead-in over a capitals line. */
export function Heading({
  script,
  caps,
  as: Tag = "h2",
  className,
  id,
}: {
  script: string;
  caps: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
}) {
  return (
    <Tag className={clsx("heading", className)} id={id}>
      <span className="heading-script">{script}</span>
      <span className="heading-caps">{caps}</span>
    </Tag>
  );
}

type Tone = "light" | "dark" | "emerald";
const pillClass = (tone: Tone, className?: string) =>
  clsx("pill", tone !== "light" && tone, className);

function PillInner({
  children,
  icon = "arrow",
  pending = false,
}: {
  children: ReactNode;
  icon?: IconName;
  pending?: boolean;
}) {
  return (
    <>
      <span data-label>{children}</span>
      <span className="dot">
        {pending ? (
          <span className="pill-spin" aria-hidden="true" />
        ) : (
          <Icon name={icon} />
        )}
      </span>
    </>
  );
}

/** Pill link with the round arrow dot. */
export function PillLink({
  tone = "light",
  className,
  children,
  ...rest
}: { tone?: Tone } & ComponentProps<typeof Link>) {
  return (
    <Link className={pillClass(tone, className)} {...rest}>
      <PillInner>{children}</PillInner>
    </Link>
  );
}

/**
 * Pill button. `pending` shows a spinner in the dot, marks the button busy
 * and stops repeat presses while the action runs.
 */
export function PillButton({
  tone = "light",
  className,
  children,
  icon,
  pending = false,
  disabled,
  ...rest
}: {
  tone?: Tone;
  icon?: IconName;
  pending?: boolean;
} & ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={pillClass(tone, className)}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      <PillInner icon={icon} pending={pending}>
        {children}
      </PillInner>
    </button>
  );
}
