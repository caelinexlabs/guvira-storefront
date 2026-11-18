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
      <main id="main" className="wrap track">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Track your order</span>
        </nav>
        <div className="track-grid">
          <div className="track-intro">
            <Heading as="h1" script="where is" caps="My order" />
            <p className="track-lead">
              Enter your order number and the email or mobile you ordered with
              to see its status, parcels and tracking links.
            </p>
            <p className="track-alt">
              Have an account? <Link href="/account">Sign in</Link> to see every
              order in one place.
            </p>
          </div>
          <TrackForm />
        </div>
      </main>
      <SiteFooter slim />
    </>
  );
}
