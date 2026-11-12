"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PillLink } from "@/components/ui";
import { useShop } from "@/lib/store/shop";
import { recoverBag } from "./actions";

/**
 * Puts the bag from a reminder email back, then shows it. The link's secret
 * works once, so this runs once per visit and never on a retry.
 */
export function RecoverBag({ secret }: { secret: string }) {
  const router = useRouter();
  const openBag = useShop((s) => s.openBag);
  const [state, setState] = useState<"working" | "expired" | "unavailable">(
    "working",
  );
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    recoverBag(secret).then((r) => {
      if (r.status !== "ok") return setState(r.status);
      useShop.setState({ bag: r.lines });
      // Take the secret out of the address bar, then show the bag.
      router.replace(r.lines.length ? "/shop" : "/");
      if (r.lines.length) openBag(true);
    });
  }, [secret, router, openBag]);

  if (state === "working")
    return <output className="recover-status">Putting your bag back…</output>;
  return (
    <div className="empty-state">
      <p>
        {state === "expired"
          ? "That link has expired, so we couldn’t restore your bag."
          : "We couldn’t reach the shop just now. Open the link again in a moment."}
      </p>
      <PillLink href="/shop">Shop jewellery</PillLink>
    </div>
  );
}
