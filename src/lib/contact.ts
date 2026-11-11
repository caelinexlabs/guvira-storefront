import "server-only";
import { getShopSettings } from "@/lib/caelinex/settings";

export type SocialLink = {
  icon: "instagram" | "facebook" | "pinterest" | "youtube";
  label: string;
  href: string;
};

export type Contact = {
  email: string;
  phone: string;
  address: string;
  social: SocialLink[];
};

// The owner's contact details and social profiles, from the admin. Anything
// they haven't set stays out; no link points at a made-up profile.
export async function getContact(): Promise<Contact> {
  const { contact } = await getShopSettings();
  const s = contact.social;
  const all: SocialLink[] = [
    { icon: "instagram", label: "Instagram", href: s.instagram },
    { icon: "facebook", label: "Facebook", href: s.facebook },
    { icon: "pinterest", label: "Pinterest", href: s.pinterest },
    { icon: "youtube", label: "YouTube", href: s.youtube },
  ];
  return {
    email: contact.email,
    phone: contact.phone,
    address: contact.address,
    social: all.filter((l) => l.href),
  };
}
