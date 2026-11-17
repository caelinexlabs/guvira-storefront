import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading } from "@/components/ui";
import { getShopSettings } from "@/lib/caelinex/settings";
import { listShopperOrders } from "@/lib/caelinex/shopper";
import { signOut } from "../actions";
import { AccountNav } from "./account-nav";
import { getAccount } from "./session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, customer } = await getAccount();
  const [orders, settings] = await Promise.all([
    listShopperOrders(token),
    getShopSettings(),
  ]);
  const name = customer.ok ? customer.value.name.split(" ")[0] : "";
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap acct">
        <Heading
          as="h1"
          script={name ? `hello ${name.toLowerCase()}` : "hello"}
          caps="Your account"
        />
        <div className="acct-shell">
          <aside className="acct-side">
            <AccountNav
              orders={orders.ok ? orders.value.total : undefined}
              wishlist={settings.features.wishlist}
            />
            <form action={signOut}>
              <button type="submit" className="acct-out">
                Sign out
              </button>
            </form>
          </aside>
          <div className="acct-main">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
