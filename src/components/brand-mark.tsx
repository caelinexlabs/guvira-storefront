import Image from "next/image";

/** The Guvira lotus, in evergreen, for the quiet moments on a light page. */
export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <Image
      className="brand-mark"
      src="/brand/guvira-lotus-evergreen.png"
      alt=""
      width={Math.round(size * 0.9)}
      height={size}
      unoptimized
    />
  );
}
