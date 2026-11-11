// Payment methods. Card and UPI details are never typed into this site:
// "online" opens Razorpay's own window, which collects them.

export const PAYMENT_METHODS = [
  {
    id: "online",
    label: "Pay online",
    note: "UPI, cards, netbanking and wallets",
  },
  { id: "cod", label: "Cash on delivery", note: "Pay when it arrives" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];

/** Cash on delivery is for Indian addresses only. */
export const methodAvailable = (m: PaymentMethod, country: string) =>
  m === "cod" ? country === "IN" : true;

/** What the order record and confirmation page show. */
export const paymentLabel = (method: PaymentMethod) =>
  method === "cod" ? "Cash on delivery" : "Paid online";
