import type { Metadata } from "next";
import { listAddresses } from "@/lib/caelinex/shopper";
import { signOutAllDevices } from "../../actions";
import { getAccount } from "../session";
import { AddressBook } from "./address-book";
import { ContactRow } from "./contact-row";
import { NameForm } from "./name-form";

export const metadata: Metadata = {
  title: "Your details",
  robots: { index: false },
};

export default async function AccountDetails() {
  const { token, customer } = await getAccount();
  const addresses = await listAddresses(token);
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
            <NameForm
              firstName={who.firstName}
              lastName={who.lastName}
              name={who.name}
            />
            <ContactRow
              kind="email"
              value={who.email}
              verified={who.emailVerified}
            />
            <ContactRow
              kind="phone"
              value={who.phone}
              verified={who.phoneVerified}
            />
          </dl>
        ) : (
          <p>We couldn’t load your details just now. Refresh to try again.</p>
        )}
      </section>

      <section className="acct-card" aria-labelledby="addr-h">
        <h2 className="acct-h" id="addr-h">
          Addresses
        </h2>
        {addresses.ok ? (
          <AddressBook addresses={addresses.value.addresses} />
        ) : (
          <p className="acct-sub" role="alert">
            We couldn’t load your addresses just now. Refresh to try again.
          </p>
        )}
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
