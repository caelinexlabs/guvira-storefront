import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading } from "@/components/ui";
import { TrackForm } from "./track-form";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false },
};

export default function TrackPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/help/orders">Order help</Link>
        </nav>
        <Heading as="h1" script="where is" caps="My order" />
        <TrackForm />
      </main>
      <SiteFooter slim />
    </>
  );
}
