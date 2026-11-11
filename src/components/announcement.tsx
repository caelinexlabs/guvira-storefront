import Link from "next/link";
import { isExternal, resolveLink } from "@/lib/link";

/** The owner's announcement bar: one line, with an optional link. */
export function Announcement({
  enabled,
  text,
  link,
}: {
  enabled: boolean;
  text: string;
  link: string;
}) {
  if (!enabled || !text) return null;
  const href = link ? resolveLink(link) : undefined;
  return (
    <div className="announce">
      {href ? (
        <Link
          href={href}
          {...(isExternal(href) ? { rel: "noopener", target: "_blank" } : {})}
        >
          {text}
        </Link>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}
