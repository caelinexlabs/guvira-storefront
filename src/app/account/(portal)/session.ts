import { redirect } from "next/navigation";
import { cache } from "react";
import { getCustomer, listShopperOrders } from "@/lib/caelinex/shopper";
import { getSessionToken } from "@/lib/session";

/** The signed-in shopper, read once per request however many parts of the page ask. */
export const getAccount = cache(async () => {
  const token = await getSessionToken();
  if (!token) redirect("/account/sign-in");
  const customer = await getCustomer(token);
  if (!customer.ok && customer.reason === "unauthorised")
    redirect("/account/sign-in");
  return { token, customer };
});

/** The shopper's orders, fetched once per request however many parts of the page ask. */
export const getOrders = cache((token: string) => listShopperOrders(token));
