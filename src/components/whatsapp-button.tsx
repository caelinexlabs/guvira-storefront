import { Icon } from "./icons";

/** A floating chat button for the number the owner set in the admin. */
export function WhatsAppButton({
  number,
  message,
}: {
  number: string;
  message: string;
}) {
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  return (
    <a
      className="whatsapp"
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
    >
      <Icon name="whatsapp" />
    </a>
  );
}
