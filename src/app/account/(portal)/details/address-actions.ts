"use server";

import { revalidatePath } from "next/cache";
import {
  deleteAddress,
  makeDefaultAddress,
  saveAddress,
} from "@/lib/caelinex/shopper";
import { countryByCode } from "@/lib/checkout/countries";
import { getSessionToken } from "@/lib/session";

const UNAVAILABLE = "We couldn’t reach our service. Try again in a minute.";

export type AddressState = {
  saved?: boolean;
  error?: string;
  /** What was typed, so a mistake doesn't wipe the form. */
  values?: Record<string, string>;
};

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();

/** Add an address, or change one when the form carries its id. */
export async function saveAddressAction(
  _prev: AddressState,
  form: FormData,
): Promise<AddressState> {
  const token = await getSessionToken();
  if (!token) return { error: "Sign in again to change your addresses." };
  const typed: Record<string, string> = {};
  for (const k of [
    "name",
    "phone",
    "line1",
    "line2",
    "city",
    "region",
    "postalCode",
  ])
    typed[k] = text(form, k);
  const fail = (error: string): AddressState => ({ error, values: typed });
  const country = text(form, "country").toUpperCase();
  const c = countryByCode(country);
  const input = {
    name: text(form, "name"),
    phone: text(form, "phone") || undefined,
    line1: text(form, "line1"),
    line2: text(form, "line2") || undefined,
    city: text(form, "city"),
    region: text(form, "region") || undefined,
    postalCode: text(form, "postalCode"),
    country,
    isDefault: form.get("isDefault") === "on" || undefined,
  };
  if (!input.name) return fail("Enter the name for this address.");
  if (!input.line1) return fail("Enter the first line of the address.");
  if (!input.city) return fail("Enter the city.");
  if (c?.regions && !input.region)
    return fail(`Choose a ${c.regionLabel?.toLowerCase() ?? "state"}.`);
  if (!input.postalCode)
    return fail(
      `Enter the ${c?.postal?.label.toLowerCase() ?? "postal code"}.`,
    );
  if (c?.postal && !c.postal.pattern.test(input.postalCode))
    return fail(
      `Check the ${c.postal.label.toLowerCase()}. It looks like ${c.postal.example}.`,
    );
  const id = text(form, "id") || undefined;
  const r = await saveAddress(token, input, id);
  if (!r.ok) return fail(r.message ?? UNAVAILABLE);
  revalidatePath("/account/details");
  return { saved: true };
}

export async function makeDefaultAction(id: string) {
  const token = await getSessionToken();
  if (token) await makeDefaultAddress(token, id);
  revalidatePath("/account/details");
}

export async function removeAddressAction(id: string) {
  const token = await getSessionToken();
  if (token) await deleteAddress(token, id);
  revalidatePath("/account/details");
}
