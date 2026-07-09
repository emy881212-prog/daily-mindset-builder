# Daily Mindset Builder

A responsive wellness and motivation app prototype with personalized quotes, mood check-ins, saved content, insights, and a complete membership experience.

Production: https://daily-mindset-builder.vercel.app/daily-mindset-builder/today

## Run locally

1. Copy `.env.example` to `.env`.
2. Add the Client ID and Secret from your PayPal Sandbox REST app.
3. Run `npm run paypal:setup-plans` once in PayPal Sandbox and copy the six returned plan IDs into `.env`.
4. In the PayPal Developer Dashboard, add an HTTPS webhook pointing to `/api/paypal/webhooks`. Subscribe to subscription activation, update, cancellation, suspension, expiration, payment failure, sale completion, sale denial, and refund events. Add its Webhook ID to `.env`.
5. Run `npm start` and open the `APP_URL` from `.env`.

## Public URL and custom domains

The canonical app path is `/daily-mindset-builder`. The server redirects `/` to `/daily-mindset-builder/today`, and every SPA page has its own clean route under that base path. Set `PUBLIC_APP_URL` once to control PayPal return URLs, login/signup links, and notification deep links.

Settings includes a custom-domain reservation field. When DNS and hosting are ready, set `PUBLIC_APP_URL` to the verified HTTPS address (for example `https://www.dailymindsetbuilder.com/daily-mindset-builder`) and update the PayPal app’s allowed return and webhook URLs.

The PayPal REST app is what connects checkout to the corresponding Business account. The account email is neither needed by the frontend nor exposed to customers.

## Membership flows

- Monthly and yearly pricing for Standard, Premium, and Pro
- Exact annual savings and equivalent monthly cost
- Checkout plan and billing-period selection
- Clear automatic-renewal and cancellation disclosure
- Dynamic next-renewal date
- Manage Membership billing-period switching
- Responsive desktop and mobile layouts

## Payment security

- Client Secret and webhook ID remain server-side in an ignored `.env` file.
- PayPal API calls are locked to Sandbox endpoints while checkout is being tested.
- Paid access is false while approval is pending.
- Entitlements change only after a PayPal-signed webhook is verified with the original raw webhook body.
- Renewals, cancellations, suspensions, expiration, failed payments, denied sales, and refunds update membership state.
- Webhook event IDs are stored for idempotency in Neon Postgres.
- Users, memberships, subscriptions, payment history, and daily AI usage counters use permanent database tables.
- Live checkout stays disabled. Sandbox checkout is disabled unless `PAYPAL_SANDBOX_CHECKOUT_ENABLED=true`, the database is connected, all PayPal Sandbox credentials exist, and all six Sandbox plan IDs are configured.

## Authentication

- Passwords use OWASP-strength scrypt hashing and are never stored or logged in plaintext.
- Session tokens are random, stored as hashes in Postgres, and sent only in Secure, HttpOnly, SameSite cookies.
- Email verification is required before any checkout or membership-changing request.
- Password reset and verification links are single-use and expire automatically.
- Set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` in Vercel to deliver authentication emails from a verified sender domain.
