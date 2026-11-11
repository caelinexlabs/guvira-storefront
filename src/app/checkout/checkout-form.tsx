"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { Price } from "@/components/price";
import { PillButton, PillLink } from "@/components/ui";
import type { PromoCart } from "@/lib/caelinex/promo";
import type { Customer } from "@/lib/caelinex/shopper";
import { COUNTRIES, countryByCode } from "@/lib/checkout/countries";
import {
  methodAvailable,
  type PaymentMethod,
  paymentLabel,
} from "@/lib/checkout/payment";
import {
  type CheckoutDraft,
  loadDraft,
  loadPending,
  saveDraft,
  saveOrder,
  savePending,
} from "@/lib/checkout/session-store";
import {
  type CheckoutDetails,
  EMPTY_DETAILS,
  type FieldErrors,
  validateAddress,
  validateContact,
} from "@/lib/checkout/validate";
import { CURRENCY_META, formatMoney } from "@/lib/commerce/money";
import { priceFor, totalPrices } from "@/lib/commerce/price";
import { goToRazorpay } from "@/lib/razorpay-redirect";
import { bagCount, useShop } from "@/lib/store/shop";
import {
  type DeliveryQuote,
  quoteDelivery,
  type RateOption,
} from "../delivery/actions";
import { placeOrder } from "./actions";
import { describe, Field } from "./field";
import { PaymentStep } from "./payment-step";
import { PromoCode } from "./promo-code";
import { WhoStep } from "./who-step";

type StepId = "who" | "details" | "delivery" | "payment";
type Done = CheckoutDraft["done"];

/**
 * Four steps, one open at a time: who's checking out, their details,
 * delivery, then payment. Finished steps fold into a one-line summary with
 * an Edit button. A signed-in shopper starts at their (filled-in) details.
 */
export function CheckoutForm({
  customer: initialCustomer,
  returned,
}: {
  customer?: Customer;
  /** Coming back from Razorpay without having paid. */
  returned?: { kind: "failed" | "cancelled"; reason?: string };
}) {
  const router = useRouter();
  const bag = useShop((s) => s.bag);
  const currency = useShop((s) => s.currency);
  const currencies = useShop((s) => s.currencies);
  const setCurrency = useShop((s) => s.setCurrency);
  const clearBag = useShop((s) => s.clearBag);

  const [customer, setCustomer] = useState(initialCustomer);
  const [who, setWho] = useState<CheckoutDraft["who"] | undefined>(
    initialCustomer ? "account" : undefined,
  );
  const [details, setDetails] = useState<CheckoutDetails>(() =>
    fromCustomer(EMPTY_DETAILS, initialCustomer),
  );
  const [done, setDone] = useState<Done>(initialCustomer ? ["who"] : []);
  const [open, setOpen] = useState<StepId>(initialCustomer ? "details" : "who");
  const [touched, setTouched] = useState<
    Partial<Record<keyof CheckoutDetails, boolean>>
  >({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [notice, setNotice] = useState<string | undefined>(
    returned?.kind === "cancelled"
      ? "Payment cancelled. Your bag is kept; press Pay to try again."
      : returned?.kind === "failed"
        ? `${returned.reason || "Your payment didn’t go through."} Nothing was charged. Press Pay to try again.`
        : undefined,
  );
  const attempt = useRef<string>(undefined);
  // True once this attempt has an order waiting for payment.
  const awaitingPayment = useRef(false);
  // What an order waiting for payment came to, shown on the Pay button.
  const [waitingTotal, setWaitingTotal] = useState<number>();
  // Delivery options for this address, once Caelinex has priced them.
  const [rates, setRates] = useState<RateOption[]>();
  const [rateId, setRateId] = useState<string>();
  const [shipError, setShipError] = useState<string>();
  const [pending, start] = useTransition();
  const busy = pending;

  // Coming back from a failed payment (or a refresh) picks up where it was.
  // Nothing is saved until this has run, so the empty first render can never
  // overwrite the draft.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    setRestored(true);
    // An order still waiting for payment, if the bag hasn't changed since.
    const pending = loadPending();
    const waiting =
      pending && pending.bag === bagKey(bag) ? pending : undefined;
    if (waiting) {
      attempt.current = waiting.key;
      awaitingPayment.current = true;
      setWaitingTotal(waiting.total);
    } else savePending(undefined);
    const d = loadDraft();
    if (!d) return;
    setWho(initialCustomer ? "account" : d.who);
    setDetails(fromCustomer(d.details, initialCustomer));
    // The delivery choice isn't saved (prices can change), so that step
    // reopens, unless an order is already waiting for payment.
    const kept = waiting ? d.done : d.done.filter((x) => x !== "delivery");
    const restored: Done = initialCustomer
      ? Array.from(new Set<Done[number]>(["who", ...kept]))
      : kept;
    setDone(restored);
    setOpen(waiting ? "payment" : nextOpen(restored));
    if (d.details.country !== "IN") setMethod("online");
  }, [initialCustomer, bag]);

  // Keep the draft current so nothing typed is lost (card details excluded).
  useEffect(() => {
    if (restored && who) saveDraft({ who, details, done });
  }, [restored, who, details, done]);

  const country = countryByCode(details.country);
  const contactErrors = validateContact(details);
  const addressErrors = validateAddress(details);
  const addressOk = Object.keys(addressErrors).length === 0;
  const payOk = methodAvailable(method, details.country);
  const subtotal = totalPrices(bag);
  const shown = priceFor(subtotal, currency);
  const [promoCart, setPromoCart] = useState<PromoCart>();
  const rate = rates?.find((r) => r.id === rateId);
  // What the shopper will pay as far as it is known: goods after any code,
  // plus the chosen delivery. Tax, if the shop charges it, is added by Caelinex.
  const total =
    !rate && waitingTotal != null
      ? waitingTotal
      : (promoCart?.subtotalAfterDiscount ?? shown.amount) +
        (rate && !rate.free ? rate.amount : 0);

  const errorFor = (k: keyof CheckoutDetails) =>
    serverErrors[k] ??
    (touched[k] ? (contactErrors[k] ?? addressErrors[k]) : undefined);

  const set = (key: keyof CheckoutDetails, value: string) => {
    setServerErrors({});
    setRates(undefined);
    setRateId(undefined);
    setShipError(undefined);
    setDetails((d) => ({
      ...d,
      [key]: value,
      ...(key === "country" ? { region: "", postal: "" } : {}),
    }));
    if (key === "country" && !methodAvailable(method, value))
      setMethod("online");
  };
  const blur = (key: keyof CheckoutDetails) =>
    setTouched((t) => ({ ...t, [key]: true }));
  const touchAll = (keys: (keyof CheckoutDetails)[]) =>
    setTouched((t) => ({
      ...t,
      ...Object.fromEntries(keys.map((k) => [k, true])),
    }));

  const finish = (step: Done[number], next: StepId) => {
    setDone((d) => (d.includes(step) ? d : [...d, step]));
    setOpen(next);
    requestAnimationFrame(() =>
      document
        .getElementById(`step-${next}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const onAccount = (c: Customer) => {
    setCustomer(c);
    setWho("account");
    setDetails((d) => fromCustomer(d, c));
    finish("who", "details");
  };
  const onGuest = (g: { email: string; phone: string }) => {
    setWho("guest");
    // Guests only bring their email and mobile; the name is theirs to add.
    setDetails((d) => ({ ...d, email: g.email, phone: g.phone }));
    finish("who", "details");
  };

  // Price delivery for the address. With nothing to choose, go straight on.
  const continueToPayment = () => {
    if (!addressOk || busy) return;
    if (rates) return rate ? finish("delivery", "payment") : undefined;
    start(async () => {
      const q: DeliveryQuote = await quoteDelivery(
        {
          country: details.country,
          region: details.region,
          postal: details.postal,
        },
        bag.map((l) => ({ id: l.id, qty: l.qty })),
      );
      if (q.status === "no-service")
        return setShipError(
          "We don’t deliver to this address yet. Try another address.",
        );
      if (q.status === "rates") {
        setRates(q.rates);
        if (q.rates.length === 1) {
          setRateId(q.rates[0].id);
          return finish("delivery", "payment");
        }
        return;
      }
      // No cart in Caelinex yet, no shipping zones, or no answer: the cost is
      // confirmed with the order, as before.
      finish("delivery", "payment");
    });
  };

  // The order is in Caelinex and paid (or payable on delivery): keep a record
  // for the confirmation page and clear the bag.
  const complete = (r: {
    orderNumber: string;
    token: string;
    currency: string;
    total: number;
  }) => {
    attempt.current = undefined;
    awaitingPayment.current = false;
    savePending(undefined);
    saveOrder({
      number: r.orderNumber,
      token: r.token,
      placedAt: new Date().toISOString(),
      email: details.email.trim(),
      phone: `${country?.dialCode ?? ""} ${details.phone.trim()}`.trim(),
      name: details.fullName.trim(),
      address: addressLines(details),
      payment: paymentLabel(method),
      cod: method === "cod",
      lines: bag,
      currency: r.currency as typeof shown.currency,
      total: r.total,
    });
    saveDraft(undefined);
    router.push("/checkout/success");
    clearBag();
  };

  const pay = () => {
    if (!payOk || busy) return;
    setNotice(undefined);
    start(async () => {
      // One key per attempt: a retry after no answer, or after a closed
      // payment window, repeats it, so the order can never be placed twice.
      const key = attempt.current ?? crypto.randomUUID();
      attempt.current = key;
      const r = await placeOrder(
        details,
        bag.map((l) => ({ id: l.id, qty: l.qty })),
        method,
        rateId,
        key,
        awaitingPayment.current,
      );
      if (r.status === "retry") {
        setNotice("We couldn’t reach the shop just now. Try again.");
        return;
      }
      if (r.status === "invalid") {
        attempt.current = undefined;
        awaitingPayment.current = false;
        savePending(undefined);
        setServerErrors(r.errors);
        const contactBad = Object.keys(r.errors).some((k) =>
          ["fullName", "email", "phone"].includes(k),
        );
        setOpen(contactBad ? "details" : "delivery");
        return;
      }
      if (r.status === "bag-changed") {
        attempt.current = undefined;
        awaitingPayment.current = false;
        savePending(undefined);
        setNotice(r.message);
        return;
      }
      if (r.status === "created") return complete(r);

      // Online: this tab goes to Razorpay's hosted page and comes back to
      // /checkout/return, where Caelinex confirms the payment. The order and
      // its key are kept, so a failed or cancelled payment can be retried.
      awaitingPayment.current = true;
      savePending({
        key,
        bag: bagKey(bag),
        total: r.total,
        currency: r.currency as typeof shown.currency,
      });
      goToRazorpay(
        r.payment,
        { token: r.token, number: r.orderNumber },
        {
          name: details.fullName.trim(),
          email: details.email.trim(),
          contact: `${country?.dialCode ?? ""}${details.phone.trim()}`,
        },
      );
    });
  };

  if (!bag.length && !busy) {
    return (
      <div className="empty-state">
        <span className="ic">
          <Icon name="bag" />
        </span>
        <p>Your bag is empty, so there’s nothing to check out yet.</p>
        <PillLink href="/shop">Shop jewellery</PillLink>
      </div>
    );
  }

  const edit = (step: StepId) => () => setOpen(step);

  return (
    <div className="checkout">
      <div className="co-steps">
        {notice && (
          <p className="notice notice-error" role="alert">
            {notice}
          </p>
        )}
        {/* 1. Who's checking out */}
        <Step
          id="who"
          n={1}
          title="How would you like to check out?"
          open={open === "who"}
          done={done.includes("who")}
          summary={
            who === "account" && customer
              ? `Signed in as ${customer.name || customer.email || customer.phone}`
              : who === "guest"
                ? `Guest checkout · ${details.email}`
                : undefined
          }
          onEdit={customer ? undefined : edit("who")}
        >
          <WhoStep
            initialGuest={
              who === "guest"
                ? { email: details.email, phone: details.phone }
                : undefined
            }
            onAccount={onAccount}
            onGuest={onGuest}
          />
        </Step>

        {/* 2. Details */}
        <Step
          id="details"
          n={2}
          title="Your details"
          open={open === "details"}
          done={done.includes("details")}
          locked={!done.includes("who")}
          summary={`${details.fullName} · ${details.email} · ${details.phone}`}
          onEdit={edit("details")}
        >
          <form
            className="co-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              touchAll(["fullName", "email", "phone"]);
              const first = Object.keys(contactErrors)[0];
              if (first) document.getElementById(`co-${first}`)?.focus();
              else finish("details", "delivery");
            }}
          >
            {who === "account" && customer && (
              <p className="co-filled">
                <Icon name="check" /> Filled in from your account.
              </p>
            )}
            <Field id="fullName" label="Full name" error={errorFor("fullName")}>
              <input
                {...describe("fullName", errorFor("fullName"))}
                autoComplete="name"
                value={details.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                onBlur={() => blur("fullName")}
              />
            </Field>
            <div className="co-row">
              <Field id="email" label="Email" error={errorFor("email")}>
                <input
                  {...describe("email", errorFor("email"))}
                  type="email"
                  spellCheck={false}
                  autoComplete="email"
                  value={details.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => blur("email")}
                />
              </Field>
              <Field
                id="phone"
                label="Mobile number"
                hint="For delivery updates only."
                error={errorFor("phone")}
              >
                <input
                  {...describe("phone", errorFor("phone"), true)}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={details.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  onBlur={() => blur("phone")}
                />
              </Field>
            </div>
            <PillButton tone="dark" className="wide" type="submit">
              Continue to delivery
            </PillButton>
          </form>
        </Step>

        {/* 3. Delivery */}
        <Step
          id="delivery"
          n={3}
          title="Delivery"
          open={open === "delivery"}
          done={done.includes("delivery")}
          locked={!done.includes("details")}
          summary={[addressLines(details).slice(1).join(", "), rate?.name]
            .filter(Boolean)
            .join(" · ")}
          onEdit={edit("delivery")}
        >
          <form
            className="co-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              continueToPayment();
            }}
          >
            <Field id="country" label="Country" error={errorFor("country")}>
              <select
                {...describe("country", errorFor("country"))}
                autoComplete="country"
                value={details.country}
                onChange={(e) => set("country", e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            {country &&
              country.currency !== currency &&
              currencies.includes(country.currency) && (
                <p className="field-note">
                  Shopping from {country.name}?{" "}
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setCurrency(country.currency)}
                  >
                    Show prices in {CURRENCY_META[country.currency].label}
                  </button>
                </p>
              )}
            <Field
              id="line1"
              label="House number and street"
              error={errorFor("line1")}
            >
              <input
                {...describe("line1", errorFor("line1"))}
                autoComplete="address-line1"
                value={details.line1}
                onChange={(e) => set("line1", e.target.value)}
                onBlur={() => blur("line1")}
              />
            </Field>
            <Field id="line2" label="Apartment, landmark (optional)">
              <input
                {...describe("line2")}
                autoComplete="address-line2"
                value={details.line2}
                onChange={(e) => set("line2", e.target.value)}
              />
            </Field>
            <div className="co-row">
              <Field id="city" label="Town or city" error={errorFor("city")}>
                <input
                  {...describe("city", errorFor("city"))}
                  autoComplete="address-level2"
                  value={details.city}
                  onChange={(e) => set("city", e.target.value)}
                  onBlur={() => blur("city")}
                />
              </Field>
              {country?.regions && (
                <Field
                  id="region"
                  label={country.regionLabel ?? "Region"}
                  error={errorFor("region")}
                >
                  <select
                    {...describe("region", errorFor("region"))}
                    autoComplete="address-level1"
                    value={details.region}
                    onChange={(e) => set("region", e.target.value)}
                    onBlur={() => blur("region")}
                  >
                    <option value="">Choose…</option>
                    {country.regions.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
              )}
              {country?.postal && (
                <Field
                  id="postal"
                  label={country.postal.label}
                  error={errorFor("postal")}
                >
                  <input
                    {...describe("postal", errorFor("postal"))}
                    spellCheck={false}
                    autoComplete="postal-code"
                    value={details.postal}
                    onChange={(e) => set("postal", e.target.value)}
                    onBlur={() => blur("postal")}
                  />
                </Field>
              )}
            </div>
            {rates && rates.length > 1 && (
              <fieldset className="ship-rates">
                <legend className="vh">Delivery option</legend>
                {rates.map((r) => (
                  <label
                    key={r.id}
                    className={clsx("ship-rate", rateId === r.id && "on")}
                  >
                    <input
                      type="radio"
                      name="shipping-rate"
                      className="vh"
                      checked={rateId === r.id}
                      onChange={() => setRateId(r.id)}
                    />
                    <b>{r.name}</b>
                    <span className="cost">
                      {r.free ? "Free" : formatMoney(r.amount, shown.currency)}
                    </span>
                    <small className="when">{rateWhen(r)}</small>
                  </label>
                ))}
              </fieldset>
            )}
            {shipError && (
              <p className="notice notice-error" role="alert">
                {shipError}
              </p>
            )}
            <PillButton
              tone="dark"
              className="wide"
              type="submit"
              disabled={!addressOk || busy || (!!rates && !rate)}
              aria-describedby={addressOk ? undefined : "delivery-hint"}
            >
              Continue to payment
            </PillButton>
            {!addressOk && (
              <small className="co-hint" id="delivery-hint">
                Fill in your address to continue.
              </small>
            )}
          </form>
        </Step>

        {/* 4. Payment */}
        <Step
          id="payment"
          n={4}
          title="Payment"
          open={open === "payment"}
          done={false}
          locked={!done.includes("delivery")}
        >
          <PaymentStep
            country={details.country}
            method={method}
            onMethod={setMethod}
          />
          <PillButton
            tone="dark"
            className={clsx("wide pay-now", payOk && "ready")}
            type="button"
            disabled={!payOk || busy}
            onClick={pay}
            icon={method === "cod" ? "check" : "shield"}
          >
            {pending
              ? method === "online"
                ? "Waiting for payment…"
                : "Placing your order…"
              : method === "cod"
                ? `Place order · ${formatMoney(total, shown.currency)}`
                : `Pay ${formatMoney(total, shown.currency)}`}
          </PillButton>
        </Step>
      </div>

      <aside className="co-summary" aria-labelledby="summary-h">
        <h2 id="summary-h">
          Your order <span>({bagCount(bag)})</span>
        </h2>
        <ul>
          {bag.map((l) => (
            <li key={`${l.id}-${l.size ?? ""}`}>
              <span className="thumb">
                <Image
                  src={l.image.src}
                  alt=""
                  width={64}
                  height={80}
                  style={{ objectPosition: l.image.position }}
                />
                <b>{l.qty}</b>
              </span>
              <span className="what">
                {l.name}
                <small>{l.size ? `Size ${l.size}` : l.line}</small>
              </span>
              <Price prices={l.prices} qty={l.qty} />
            </li>
          ))}
        </ul>
        <PromoCode
          onChange={(c) => {
            setPromoCart(c);
            // A free-delivery offer changes the delivery prices.
            setRates(undefined);
            setRateId(undefined);
          }}
        />
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>
              <Price prices={subtotal} />
            </dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>
              {rate
                ? rate.free
                  ? "Free"
                  : formatMoney(rate.amount, shown.currency)
                : "Confirmed with your order"}
            </dd>
          </div>
          <div>
            <dt>Taxes</dt>
            <dd>Confirmed with your order</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

/** "Arrives 12 to 14 Nov", or the day range when no dates came back. */
function rateWhen(r: RateOption): string {
  if (r.from && r.to) {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    return r.from === r.to
      ? `Arrives ${fmt(r.from)}`
      : `Arrives ${fmt(r.from)} to ${fmt(r.to)}`;
  }
  if (r.minDays != null && r.maxDays != null)
    return r.minDays === r.maxDays
      ? `${r.minDays} days`
      : `${r.minDays} to ${r.maxDays} days`;
  return "";
}

function Step({
  id,
  n,
  title,
  open,
  done,
  locked,
  summary,
  onEdit,
  children,
}: {
  id: StepId;
  n: number;
  title: string;
  open: boolean;
  done: boolean;
  locked?: boolean;
  summary?: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const state = open ? "open" : done ? "done" : locked ? "locked" : "waiting";
  return (
    <section
      id={`step-${id}`}
      className={clsx("co-step", `is-${state}`)}
      aria-labelledby={`step-${id}-h`}
    >
      <header className="co-step-head">
        <span className="co-num" aria-hidden="true">
          {done && !open ? <Icon name="check" /> : n}
        </span>
        <div>
          <h2 id={`step-${id}-h`}>{title}</h2>
          {done && !open && summary && <p>{summary}</p>}
        </div>
        {done && !open && onEdit && (
          <button
            type="button"
            className="text-btn"
            onClick={onEdit}
            aria-label={`Edit ${title.toLowerCase()}`}
          >
            Edit
          </button>
        )}
      </header>
      {open && <div className="co-step-body">{children}</div>}
    </section>
  );
}

function fromCustomer(d: CheckoutDetails, c?: Customer): CheckoutDetails {
  if (!c) return d;
  return {
    ...d,
    fullName: d.fullName || c.name,
    email: d.email || c.email || "",
    phone: d.phone || c.phone || "",
  };
}

function nextOpen(done: Done): StepId {
  if (!done.includes("who")) return "who";
  if (!done.includes("details")) return "details";
  if (!done.includes("delivery")) return "delivery";
  return "payment";
}

function addressLines(d: CheckoutDetails): string[] {
  const country = countryByCode(d.country);
  return [
    d.fullName,
    d.line1,
    d.line2,
    [d.city, d.region, d.postal].filter(Boolean).join(" "),
    country?.name ?? "",
  ]
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The bag as a short signature, to tell whether it changed. */
const bagKey = (bag: { id: string; qty: number }[]) =>
  bag.map((l) => `${l.id}:${l.qty}`).join(",");
