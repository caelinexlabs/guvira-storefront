import type { Metadata } from "next";
import { signOutAllDevices } from "../../actions";
import { getAccount } from "../session";

export const metadata: Metadata = {
  title: "Your details",
  robots: { index: false },
};

export default async function AccountDetails() {
  const { customer } = await getAccount();
  const who = customer.ok ? customer.value : undefined;
  return (
    <div className="acct-stack">
      <section className="acct-card" aria-labelledby="det-h">
        <h2 className="acct-h" id="det-h">
          Contact details
        </h2>
        <p className="acct-sub">
          We use these for order updates and to sign you in.
        </p>
        {who ? (
          <dl className="acct-fields">
            <div>
              <dt>Name</dt>
              <dd>{who.name || "Not added"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{who.email ?? "Not added"}</dd>
            </div>
            <div>
              <dt>Mobile</dt>
              <dd>{who.phone ?? "Not added"}</dd>
            </div>
          </dl>
        ) : (
          <p>We couldn’t load your details just now. Refresh to try again.</p>
        )}
      </section>

      <section className="acct-card" aria-labelledby="addr-h">
        <h2 className="acct-h" id="addr-h">
          Addresses
        </h2>
        <p className="acct-sub">
          Saved delivery addresses aren’t available yet. You can enter an
          address at checkout.
        </p>
      </section>

      <section className="acct-card acct-row">
        <div>
          <h2 className="acct-h acct-h-sm">Signed in on other devices?</h2>
          <p className="acct-sub">Sign out everywhere, this device included.</p>
        </div>
        <form action={signOutAllDevices}>
          <button type="submit" className="acct-ghost">
            Sign out of all devices
          </button>
        </form>
      </section>
    </div>
  );
}
