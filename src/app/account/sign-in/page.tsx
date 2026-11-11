import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading, PillLink } from "@/components/ui";
import { caelinexConnected, getCustomer } from "@/lib/caelinex/shopper";
import { getSessionToken } from "@/lib/session";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function SignInPage() {
  // Only a token Caelinex still accepts skips the form; a stale one is ignored.
  const token = await getSessionToken();
  if (token && (await getCustomer(token)).ok) redirect("/account");
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap auth">
        <Heading as="h1" script="welcome" caps="Sign in" />
        <p className="auth-intro">
          See your orders and saved addresses. New here? You don’t need an
          account to shop.
        </p>
        {caelinexConnected ? (
          <SignInForm />
        ) : (
          <div className="auth-form">
            <output className="notice">
              Sign-in isn’t switched on yet. You can still shop and check out as
              a guest.
            </output>
            <PillLink tone="dark" href="/shop" className="wide">
              Continue shopping
            </PillLink>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
