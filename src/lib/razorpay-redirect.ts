"use client";

const ACTION = "https://api.razorpay.com/v1/checkout/embedded";

/**
 * Send the shopper to Razorpay's hosted payment page in this tab. The amount
 * is fixed by the Razorpay order Caelinex made, so it is not sent here, and
 * the key id is public. Card or UPI details are typed on Razorpay's page.
 */
export function goToRazorpay(
  payment: { keyId: string; razorpayOrderId: string },
  order: { token: string; number: string },
  prefill: { name: string; email: string; contact: string },
) {
  const origin = window.location.origin;
  const fields: Record<string, string> = {
    key_id: payment.keyId,
    order_id: payment.razorpayOrderId,
    name: "Guvira",
    description: `Order ${order.number}`,
    "prefill[name]": prefill.name,
    "prefill[email]": prefill.email,
    "prefill[contact]": prefill.contact,
    callback_url: `${origin}/checkout/return?order=${encodeURIComponent(order.token)}`,
    cancel_url: `${origin}/checkout?cancelled=${encodeURIComponent(order.token)}`,
  };
  const form = document.createElement("form");
  form.method = "POST";
  form.action = ACTION;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
