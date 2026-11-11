import { type NextRequest, NextResponse } from "next/server";
import { forgetCart } from "@/lib/caelinex/cart-sync";
import { confirmRazorpayPayment, getOrder } from "@/lib/caelinex/orders";

// Razorpay sends the shopper's browser back here with a cross-site form POST,
// so this is a route handler and not a page. The body is never trusted on its
// own: only Caelinex's confirm call, which checks Razorpay's signature, proves
// the payment. Every answer is a 303, so a refresh can't resubmit the form.

const TOKEN = /^[\w-]{10,100}$/;

const go = (req: NextRequest, path: string) =>
  NextResponse.redirect(new URL(path, req.url), 303);

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("order") ?? "";
  if (!TOKEN.test(token)) return go(req, "/checkout");

  const form = await req.formData().catch(() => new FormData());
  const paymentId = text(form, "razorpay_payment_id");
  const orderId = text(form, "razorpay_order_id");
  const signature = text(form, "razorpay_signature");

  let reason = "";
  if (paymentId && orderId && signature) {
    const r = await confirmRazorpayPayment(token, {
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });
    if (r.ok) {
      await forgetCart();
      return go(req, `/orders/${token}`);
    }
    // A double return, or a webhook that got there first: it is paid already.
    const order = await getOrder(token);
    if (order.ok && order.value.paymentStatus === "PAID") {
      await forgetCart();
      return go(req, `/orders/${token}`);
    }
    reason =
      r.reason === "invalid" && r.message
        ? r.message
        : "We couldn’t confirm your payment yet.";
  } else {
    // A failed or abandoned payment: Razorpay's own wording, if it sent any.
    reason = text(form, "error[description]");
  }

  const params = new URLSearchParams({ payment: "failed", order: token });
  if (reason) params.set("reason", reason.slice(0, 200));
  return go(req, `/checkout?${params}`);
}

// Someone opening the address directly, or a flow that redirects with GET.
export function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("order") ?? "";
  return go(req, TOKEN.test(token) ? `/orders/${token}` : "/checkout");
}
