import { getReturns, RETURN_REASONS } from "@/lib/caelinex/returns";
import { formatMoney } from "@/lib/commerce/money";
import type { Currency } from "@/lib/commerce/types";
import { orderDate } from "@/lib/order-status";
import { ReturnForm } from "./return-form";

const STATUS: Record<string, string> = {
  REQUESTED: "Asked for, waiting for the shop",
  APPROVED: "Approved. Send the piece back",
  REJECTED: "Not approved",
  RECEIVED: "Received, refund on its way",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

/**
 * Returns for one order, when the shop has switched them on: what you have
 * asked for, and a form for what you still can. Says nothing when returns are
 * off or the order has nothing to return.
 */
export async function ReturnPanel({
  orderToken,
  currency,
}: {
  orderToken: string;
  currency: string;
}) {
  const r = await getReturns(orderToken);
  if (!r.ok || !r.value.policy.enabled) return null;
  const { policy, returnable, returns } = r.value;
  const canAsk = policy.canRequest && returnable.length > 0;
  if (!canAsk && returns.length === 0) return null;

  return (
    <section className="ord-returns" aria-labelledby={`ret-${orderToken}`}>
      <h3 id={`ret-${orderToken}`}>Returns</h3>
      {returns.length > 0 && (
        <ul className="ord-return-list">
          {returns.map((x) => (
            <li key={x.returnNumber}>
              <b>Return {x.returnNumber}</b>
              <span>{STATUS[x.status] ?? x.status}</span>
              {x.decisionNote && <small>{x.decisionNote}</small>}
              {x.status === "REFUNDED" && x.refundAmount != null && (
                <small>
                  Refund of {formatMoney(x.refundAmount, currency as Currency)}
                </small>
              )}
            </li>
          ))}
        </ul>
      )}
      {canAsk && (
        <ReturnForm
          orderToken={orderToken}
          lines={returnable}
          endsAt={policy.endsAt}
          reasons={Object.entries(RETURN_REASONS).map(([code, label]) => ({
            code,
            label,
          }))}
        />
      )}
      {!canAsk && policy.endsAt && (
        <p className="ord-return-note">
          The return window closed on {orderDate(policy.endsAt)}.
        </p>
      )}
    </section>
  );
}
