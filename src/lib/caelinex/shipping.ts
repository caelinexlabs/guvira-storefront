import "server-only";
import { type StorefrontResult, storefront } from "./storefront";

export type ShippingRate = {
  id: string;
  name: string;
  /** In the cart's currency. */
  amount: number;
  free: boolean;
  freeAbove: number | null;
  minDays: number | null;
  maxDays: number | null;
  estimatedDelivery: { from: string; to: string } | null;
};

export type ShippingQuote = {
  /** False when the shop has no shipping zones: nothing to charge or choose. */
  required: boolean;
  serviceable: boolean;
  zone: { id: string; name: string } | null;
  rates: ShippingRate[];
};

export type Serviceability = {
  required: boolean;
  serviceable: boolean;
  minDays: number | null;
  maxDays: number | null;
};

const qs = (o: Record<string, string>) =>
  new URLSearchParams(Object.entries(o).filter(([, v]) => v !== "")).toString();

/** Does the shop deliver to this postcode, and how long does it take? No cart needed. */
export const getServiceability = (
  country: string,
  postalCode: string,
): Promise<StorefrontResult<Serviceability>> =>
  storefront<Serviceability>(`/serviceability?${qs({ country, postalCode })}`);

/** What delivery costs for a cart at an address. */
export const getShippingQuote = (
  cartToken: string,
  address: { country: string; region: string; postalCode: string },
): Promise<StorefrontResult<ShippingQuote>> =>
  storefront<ShippingQuote>(
    `/carts/${encodeURIComponent(cartToken)}/shipping?${qs(address)}`,
  );
