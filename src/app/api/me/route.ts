import { getCustomer } from "@/lib/caelinex/shopper";
import { clearSession, getSessionToken } from "@/lib/session";

// Who's signed in, for the header. Pages stay static; the header asks once.
export async function GET() {
  const token = await getSessionToken();
  const me = token ? await getCustomer(token) : undefined;
  // A token Caelinex no longer knows is dropped, so the shopper is signed out cleanly.
  if (me && !me.ok && me.reason === "unauthorised") await clearSession();
  const name = me?.ok
    ? me.value.name || me.value.email || me.value.phone || ""
    : "";
  return Response.json(
    { signedIn: Boolean(me?.ok), name },
    { headers: { "cache-control": "private, no-store" } },
  );
}
