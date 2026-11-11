import type { SVGProps } from "react";

const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  ),
  bag: (
    <>
      <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  chev: <path d="m9 6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  spark: (
    <path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8Z" />
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </>
  ),
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3Z" />
    </>
  ),
  box: (
    <>
      <path d="M4 8h16v12H4z" />
      <path d="M3 4h18v4H3zM12 4v16" />
    </>
  ),
  pause: <path d="M9 6v12M15 6v12" />,
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />,
  necklace: (
    <>
      <path d="M5 4c0 7 3 11 7 11s7-4 7-11" />
      <path d="M12 15v1.5" />
      <path d="M12 16.5l-2 2.5 2 2.5 2-2.5-2-2.5Z" />
    </>
  ),
  armcuff: (
    <>
      <ellipse cx="12" cy="12" rx="8" ry="3.5" />
      <path d="M4 12v2c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-2" />
    </>
  ),
  pendant: (
    <>
      <path d="M12 3v6" />
      <circle cx="12" cy="10" r="1" />
      <path d="M12 11c-3 3-4 5-4 6.5a4 4 0 0 0 8 0c0-1.5-1-3.5-4-6.5Z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" />
    </>
  ),
  facebook: (
    <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v3h2v7h3v-7h2.5l.5-3H12V8a1 1 0 0 1 1-1h2V4Z" />
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10.6 20.6 1.9-8.1M10.3 14c-.9-3.2 1.1-6 3.7-6 2.2 0 3.6 1.5 3.6 3.6 0 2.7-1.6 4.6-3.5 4.6-1 0-1.8-.7-1.6-1.7" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10 9.5 4.5 2.5-4.5 2.5v-5Z" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20.5 5.3 16.6A8.2 8.2 0 1 1 8 19.3L4 20.5Z" />
      <path d="M9.2 8.6c-.4 2.9 2.4 6 5.4 6.1l.9-1.3-1.8-1-.8.8a4.6 4.6 0 0 1-2.4-2.4l.8-.8-1-1.8-1.1.4Z" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.4v.1" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 5.2 5.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
  ),
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className = "ico",
  ...rest
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...rest}>
      {PATHS[name]}
    </svg>
  );
}
