import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading } from "@/components/ui";
import { RecoverBag } from "./recover-bag";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * The link in a "you left something in your bag" email lands here. The bag
 * itself lives in a drawer, so without a link this page has nothing to show.
 */
export default async function CartPage({ searchParams }: Props) {
  const secret = (await searchParams).recover;
  if (typeof secret !== "string" || !secret) redirect("/shop");
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap">
        <Heading as="h1" script="your" caps="Bag" />
        <RecoverBag secret={secret} />
      </main>
      <SiteFooter slim />
    </>
  );
}
