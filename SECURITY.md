# Security policy

## Reporting a vulnerability

Do not open a public issue. Use the Report a vulnerability button on the Security tab, which reports it privately. If that is unavailable, email caelixlabs@gmail.com with the steps to reproduce.

We reply within three working days and tell you when a fix ships.

## Rules for contributors

- **No secrets in git.** Real values live in `.env` (ignored). Only `.env.example` is committed, with placeholders. If a key is committed by mistake, treat it as leaked: revoke it first, then remove it.
- **`CAELINEX_STOREFRONT_KEY` stays on the server.** Never give it a `NEXT_PUBLIC_` prefix and never send it to the browser.
- **Browser state is not trusted.** Prices, stock and totals are decided by the Caelinex API. The bag in the browser is only a request.
- **Cookies are httpOnly.** Cart and session tokens are set by the server, `secure` in production, `sameSite=lax`.
- **Payments.** Card and UPI details are entered on Razorpay, never on this site. Order tokens and payment confirmations are checked by the Caelinex API.
- **Changes go through a pull request** into `develop`, with CI passing and a review. Nothing is pushed straight to `develop` or `main`.
- **Dependencies.** Dependabot opens weekly update PRs. A new dependency needs a reason in the PR.
