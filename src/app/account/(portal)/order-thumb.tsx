import Image from "next/image";

/** A piece in an order: its photo when Caelinex has one, otherwise its first letter. */
export function OrderThumb({
  name,
  imageUrl,
  width,
}: {
  name: string;
  imageUrl?: string | null;
  width: number;
}) {
  return imageUrl ? (
    <Image
      src={imageUrl}
      alt=""
      width={width}
      height={Math.round(width * 1.25)}
      sizes={`${width}px`}
    />
  ) : (
    <span aria-hidden="true">{name.charAt(0)}</span>
  );
}
