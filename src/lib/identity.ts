// An email address or mobile number typed into a sign-in or sign-up form,
// cleaned to the form Caelinex expects. Pure, so it runs anywhere.

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const isPhone = (v: string) => /^\+?[\d\s()-]{8,20}$/.test(v);

export function cleanIdentifier(raw: unknown): string | undefined {
  const v = String(raw ?? "").trim();
  if (!v || v.length > 254) return undefined;
  if (isEmail(v)) return v.toLowerCase();
  if (isPhone(v)) return v.replace(/[\s()-]/g, "");
  return undefined;
}
