import { isEmail } from "@/lib/identity";
import { countryByCode } from "./countries";

// Checkout details: one shape, validated by the same pure function in the
// browser (instant feedback) and on the server (the real guard).

export type CheckoutDetails = {
  email: string;
  phone: string;
  fullName: string;
  country: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postal: string;
};

export type FieldErrors = Partial<Record<keyof CheckoutDetails, string>>;

export const EMPTY_DETAILS: CheckoutDetails = {
  email: "",
  phone: "",
  fullName: "",
  country: "IN",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postal: "",
};

/** Step 2: who the order is for. */
export function validateContact(d: CheckoutDetails): FieldErrors {
  const e: FieldErrors = {};
  if (!isEmail(d.email.trim()))
    e.email = "Enter an email address like name@example.com.";
  if (d.phone.replace(/\D/g, "").length < 8)
    e.phone = "Enter a mobile number with at least 8 digits.";
  if (d.fullName.trim().length < 2) e.fullName = "Enter your full name.";
  return e;
}

/** Step 3: where it goes. */
export function validateAddress(d: CheckoutDetails): FieldErrors {
  const e: FieldErrors = {};
  const country = countryByCode(d.country);
  if (!country) e.country = "Choose a country we ship to.";
  if (d.line1.trim().length < 3) e.line1 = "Enter the house number and street.";
  if (d.city.trim().length < 2) e.city = "Enter the town or city.";
  if (country?.regions && !country.regions.includes(d.region))
    e.region = `Choose a ${country.regionLabel?.toLowerCase() ?? "region"}.`;
  if (country?.postal && !country.postal.pattern.test(d.postal.trim()))
    e.postal = `Enter a valid ${country.postal.label.startsWith("PIN") ? country.postal.label : country.postal.label.toLowerCase()}${country.postal.example ? `, like ${country.postal.example}` : ""}.`;
  return e;
}

export const validateDetails = (d: CheckoutDetails): FieldErrors => ({
  ...validateContact(d),
  ...validateAddress(d),
});

export const CONTACT_KEYS = ["fullName", "email", "phone"] as const;
