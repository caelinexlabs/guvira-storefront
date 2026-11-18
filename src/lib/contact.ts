import "server-only";
import { getShopSettings } from "@/lib/caelinex/settings";

export type SocialLink = {
  icon: "instagram" | "facebook" | "pinterest" | "youtube" | "google";
  label: string;
  href: string;
};

export type Contact = {
  email: string;
  phone: string;
  address: string;
  social: SocialLink[];
};

/** Guvira's public details, used where the admin has nothing real yet. */
export const BRAND = {
  email: "contact@guvira.com",
  phone: "+91 80170 87407",
  whatsapp: "+918017087407",
  instagram: "https://www.instagram.com/guv.ira/",
  facebook: "https://www.facebook.com/guvira.ayb/",
  google: "https://maps.app.goo.gl/xJVC1R8TUv7z7tgYA",
} as const;

/** Blank, or the dummy values a fresh admin ships with (example.com, all zeros). */
export const isPlaceholder = (v: string) =>
  !v.trim() || /@example\.(com|org|net)$/i.test(v.trim()) || !/[1-9]/.test(v);

const real = (v: string, fallback: string) => (isPlaceholder(v) ? fallback : v);

// Email and phone come from the admin, with Guvira's own where the admin still
// holds a dummy value. Instagram, Facebook and Google are Guvira's own pages;
// Pinterest and YouTube show only if the owner sets them, so no link points at
// a made-up profile.
export async function getContact(): Promise<Contact> {
  const { contact } = await getShopSettings();
  const s = contact.social;
  const all: SocialLink[] = [
    { icon: "instagram", label: "Instagram", href: BRAND.instagram },
    { icon: "facebook", label: "Facebook", href: BRAND.facebook },
    { icon: "google", label: "Google", href: BRAND.google },
    { icon: "pinterest", label: "Pinterest", href: s.pinterest },
    { icon: "youtube", label: "YouTube", href: s.youtube },
  ];
  return {
    email: real(contact.email, BRAND.email),
    phone: real(contact.phone, BRAND.phone),
    address: contact.address,
    social: all.filter((l) => l.href),
  };
}
