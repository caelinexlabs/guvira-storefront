import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading, PillLink } from "@/components/ui";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap not-found">
        <Heading
          as="h1"
          script="lost"
          caps="Page not found"
          className="center"
        />
        <p>
          This page has moved or never existed. The jewellery is still here.
        </p>
        <div className="not-found-actions">
          <PillLink tone="dark" href="/shop">
            Shop all jewellery
          </PillLink>
          <Link href="/" className="text-link">
            Back to the home page
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
