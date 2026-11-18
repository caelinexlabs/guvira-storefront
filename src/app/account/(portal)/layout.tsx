import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading } from "@/components/ui";
import { getShopSettings } from "@/lib/caelinex/settings";
import { signOut } from "../actions";
import { AccountNav } from "./account-nav";
import { getAccount, getOrders } from "./session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = await getAccount();
  const [orders, settings] = await Promise.all([
    getOrders(token),
    getShopSettings(),
  ]);
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap acct">
        <Heading
          as="h1"
          script="your"
          caps="Account"
        />
        <div className="acct-shell">
          <aside className="acct-side">
            <AccountNav
              orders={orders.ok ? orders.value.total : undefined}
              wishlist={settings.features.wishlist}
            />
            <form action={signOut} className="acct-out-side">
              <button type="submit" className="acct-out">
                Sign out
              </button>
            </form>
          </aside>
          <div>
            {children}
            <form action={signOut} className="acct-out-foot">
              <button type="submit" className="acct-out">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
