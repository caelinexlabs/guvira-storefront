"use server";

import { revalidatePath } from "next/cache";
import {
  deleteAddress,
  makeDefaultAddress,
  saveAddress,
} from "@/lib/caelinex/shopper";
import { getSessionToken } from "@/lib/session";
import { addressInput } from "@/lib/validation/forms";
import { addressId, check } from "@/lib/validation/schemas";

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
  const input = check(addressInput, {
    name: text(form, "name"),
    phone: text(form, "phone"),
    line1: text(form, "line1"),
    line2: text(form, "line2"),
    city: text(form, "city"),
    region: text(form, "region"),
    postalCode: text(form, "postalCode"),
    country: text(form, "country"),
    isDefault: form.get("isDefault") === "on" || undefined,
  });
  if (!input.ok) return fail(input.message);
  const id = text(form, "id") || undefined;
  if (id && !addressId.safeParse(id).success)
    return fail("That address can’t be found. Reload the page and try again.");
  const r = await saveAddress(token, input.value, id);
  if (!r.ok) return fail(r.message ?? UNAVAILABLE);
  revalidatePath("/account/details");
  return { saved: true };
}

export async function makeDefaultAction(id: string) {
  const token = await getSessionToken();
  if (token && addressId.safeParse(id).success)
    await makeDefaultAddress(token, id);
  revalidatePath("/account/details");
}

export async function removeAddressAction(id: string) {
  const token = await getSessionToken();
  if (token && addressId.safeParse(id).success) await deleteAddress(token, id);
  revalidatePath("/account/details");
}
