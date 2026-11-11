import "server-only";
import { cookies } from "next/headers";

// The customer's Caelinex session token, kept in an httpOnly cookie so page
// scripts can never read it.
const COOKIE = "guvira_session";
const MAX_AGE = 60 * 60 * 24 * 30; // matches Caelinex's 30-day token

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

export async function setSessionToken(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

// The Caelinex cart token. Caelinex shows it once when the cart is made, so
// it is kept here, httpOnly, and sent back with each cart request.
const CART_COOKIE = "guvira_cart";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // carts expire after 30 idle days

export async function getCartToken(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

export async function setCartToken(token: string) {
  (await cookies()).set(CART_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
}

export async function clearCartToken() {
  (await cookies()).delete(CART_COOKIE);
}
