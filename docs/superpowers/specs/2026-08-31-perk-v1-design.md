# Perk v1 — Design Spec

**Date:** 2026-08-31
**Status:** Approved (sections 1–3 explicitly; 4–6 delegated to implementer's judgment)

## 1. Summary

Perk is a multi-tenant SaaS that gives coffee shops a digital loyalty stamp card delivered via Apple Wallet, Google Wallet, or a web card. A shop signs up with a magic link, configures its card, and receives a public URL `perk.app/<slug>`. Customers tap once on that page to get an anonymous pass. Baristas stamp and redeem by scanning the pass; alternatively the shop can print a static QR that customers scan to stamp themselves (rate-limited). Passes update live when the stamp count changes.

v1 is free. Billing is out of scope but the tenancy model must not need rework to add it.

## 2. Decisions locked in brainstorming

| Topic | Decision |
|---|---|
| Product type | Real SaaS; free until ≥10 shops; multi-tenant from day one |
| Program mechanic | Stamp cards (N stamps → 1 reward); schema leaves room for points |
| Stamp modes | Both, shop chooses: **barista scans pass** or **customer scans static QR** |
| Customer-scan anti-cheat | Cooldown rate limit only (default 15 min), no barista approval |
| Customer identity | Anonymous by default; optional email backup later |
| Wallets | Apple Wallet + Google Wallet from day one, plus web card fallback |
| Owner login | Magic link via email only (Resend) |
| Stack | Next.js App Router on Vercel · Drizzle ORM · Supabase Postgres · Supabase Storage |
| Redemption | Barista redeems via scan; unredeemed rewards stack |
| URL shape | Path-based `perk.app/<slug>`; custom domains are a future paid feature |
| Dashboard scope | Counters + customer list with manual adjust + activity log |
| Architecture | Single Next.js app; pass generation and wallet pushes inline in request handlers (via `waitUntil`), no separate worker |

Out of scope for v1: billing, multiple locations per shop, multiple programs per shop, points, customer messaging/push campaigns, custom pass layouts beyond logo + colour, custom domains, analytics beyond basic counters.

## 3. Data model

Postgres via Drizzle. Every tenant-owned row carries `shop_id`. Isolation is enforced in the data-access layer (every function takes `shopId` first; dashboard resolves `shopId` from the session, never from the URL). No RLS.

```
shops
  id uuid pk
  slug text unique            -- immutable after onboarding (printed on posters)
  name text
  logo_url text null          -- public Supabase Storage URL
  brand_color text            -- hex, default '#1f1f1f'
  stamps_required int         -- default 10
  reward_text text            -- e.g. "Free coffee of your choice"
  stamp_mode text             -- 'barista' | 'customer'
  customer_scan_cooldown_min int  -- default 15
  program_type text           -- 'stamps' (room for 'points')
  staff_pin text              -- 6 digits
  staff_pin_version int       -- bumped on rotate; invalidates staff cookies
  qr_secret text              -- HMAC key for the customer-scan QR token
  google_class_id text null   -- `${ISSUER_ID}.${shop.id}` once created
  created_at timestamptz

owners
  id uuid pk, email text unique, created_at
shop_owners
  shop_id, owner_id  (pk composite)      -- v1: one shop per owner, enforced in app

cards
  id uuid pk                  -- pass serial number for both wallets; QR payload
  shop_id uuid fk
  short_code text             -- 8-char base32, unique per shop, for manual entry
  stamps int                  -- progress toward next reward
  rewards_available int       -- stacked, unredeemed
  email text null             -- optional backup
  apple_auth_token text       -- random, embedded in .pkpass, auths the web service
  google_object_id text null  -- `${ISSUER_ID}.${card.id}` once saved
  last_stamped_at timestamptz null
  created_at timestamptz
  unique (shop_id, short_code)

events                        -- append-only ledger
  id bigserial pk
  shop_id uuid fk, card_id uuid fk
  type text                   -- 'card_created' | 'stamp' | 'reward_earned' | 'redeem' | 'adjust'
  delta int                   -- stamps delta (adjust may be ±n); 0 for non-stamp types
  source text                 -- 'barista_scan' | 'customer_scan' | 'owner_adjust' | 'system'
  actor text null             -- owner id for owner actions; 'staff' for PIN sessions; null otherwise
  note text null              -- adjust reason
  created_at timestamptz
  index (shop_id, created_at desc), index (card_id, created_at desc)

wallet_registrations          -- Apple device↔pass registrations
  device_library_id text, card_id uuid fk, push_token text, created_at
  pk (device_library_id, card_id)

rate_limits                   -- simple fixed-window counters (per-IP, per-email)
  key text pk, count int, window_start timestamptz

+ Auth.js tables via Drizzle adapter: users, accounts, sessions, verification_tokens
  (owners.email ↔ users.email)
```

Counter semantics: a stamp does `stamps += 1`; when `stamps == stamps_required` → `stamps = 0`, `rewards_available += 1`, and a `reward_earned` event is appended after the `stamp` event. Redeem: `rewards_available -= 1` (must be > 0), `redeem` event. Adjust: `stamps += delta` clamped to `[0, stamps_required - 1]`, `adjust` event with note; may also roll over to a reward if it reaches `stamps_required`.

All mutations to a card happen in one DB transaction with `SELECT … FOR UPDATE` on the card row. Wallet pushes run after commit.

## 4. Routing, auth, tenancy

```
/                           marketing landing + "Sign up"
/login                      magic-link form
/onboarding                 first-login wizard (name, slug, logo, colour, stamps, reward, mode)
/dashboard                  counters + recent activity
/dashboard/customers        card list, search, manual adjust
/dashboard/activity         paginated event log
/dashboard/settings         edit program (not slug), stamp mode, cooldown, staff PIN rotate
/dashboard/print            printable QR posters + staff link

/[slug]                     PUBLIC customer landing → Add to Apple / Google / web card
/[slug]/card/[cardId]       web card (stamps, QR, wallet buttons, email backup)
/[slug]/scan?t=<token>      customer-scan target (static QR)
/[slug]/staff               barista scanner (PIN-gated)

/api/wallet/apple/v1/…      Apple PassKit web service
/api/cards/[id]/apple-pass signed Apple pass download
/api/cards/[id]/google-save redirect to Google save URL (signed JWT)
```

**Owner auth:** Auth.js v5 (`next-auth@beta`), email provider through Resend, Drizzle adapter, DB sessions. Middleware guards `/dashboard/*` and `/onboarding`. No shop → `/onboarding`; has shop → `/dashboard`. Magic-link requests rate-limited per email (5 / 15 min).

**Staff access:** `/[slug]/staff` prompts for the 6-digit `staff_pin`. On success set an HttpOnly, signed cookie `perk_staff_<shopId>` containing `{shopId, pinVersion}` valid 30 days. Rotating the PIN bumps `staff_pin_version`, invalidating cookies. Staff actions are recorded with `actor='staff'`. PIN attempts rate-limited per IP (10 / 15 min).

**Customer identity:** the card `id` in the pass barcode is the credential (bearer). The web-card URL is likewise a bearer link. Same threat model as a physical card. When a card is created or the web card is opened in a browser, we set a first-party cookie `perk_card_<shopId>=<cardId>` (1 year) so the customer-scan flow can identify the card without login.

**Tenant isolation:** `lib/db/queries/*` functions all take `shopId` as first argument. Public `[slug]` routes resolve slug → shop and expose only public fields (name, logo, colour, stamps_required, reward_text, stamp_mode).

## 5. Wallet integration

```ts
interface WalletProvider {
  createPass(shop: Shop, card: Card): Promise<PassArtifact>; // Apple: Buffer; Google: save URL
  updatePass(shop: Shop, card: Card): Promise<void>;
}
```

`lib/wallet/apple.ts`, `lib/wallet/google.ts`, `lib/wallet/index.ts` (`notifyWallets(shop, card)` calls `updatePass` on both where applicable, catches and logs failures — a wallet failure never fails a stamp).

### Apple Wallet
- One platform Pass Type ID (`pass.app.perk.card`) and certificate. Per-shop branding is pass content.
- `storeCard` style. Fields: primary "Stamps" `N / stamps_required`; secondary "Reward" `reward_text`; auxiliary "Rewards ready" when `rewards_available > 0`. Back fields: shop name, "Open my card" link to the web card, "How it works". `strip.png` is a server-rendered stamp row (filled/empty circles in brand colour) via `@resvg/resvg-js` from an SVG template; `logo.png`, `icon.png` from the shop logo (resized with `sharp`) or a default.
- Barcode: QR, message = `card.id`, `altText` = `short_code`.
- Generated with `passkit-generator`. Certs from env: `APPLE_PASS_CERT_PEM`, `APPLE_PASS_KEY_PEM`, `APPLE_PASS_KEY_PASSPHRASE`, `APPLE_WWDR_PEM` (base64). `APPLE_TEAM_ID`, `APPLE_PASS_TYPE_ID`.
- `webServiceURL` = `${APP_URL}/api/wallet/apple`, `authenticationToken` = `card.apple_auth_token`.
- Web service endpoints (spec: Apple "PassKit Web Service Reference"):
  - `POST /v1/devices/{deviceId}/registrations/{passTypeId}/{serial}` → upsert `wallet_registrations`
  - `DELETE` same → remove
  - `GET /v1/devices/{deviceId}/registrations/{passTypeId}?passesUpdatedSince=` → serials whose card `updated_at` > since (we add `cards.updated_at`)
  - `GET /v1/passes/{passTypeId}/{serial}` → regenerated `.pkpass`, honours `If-Modified-Since`
  - `POST /v1/log` → console log
  - All authenticated by `Authorization: ApplePass <token>` matched against `cards.apple_auth_token`.
- Updates: APNs HTTP/2 push (token-based, `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY_PEM`) to every `push_token` for the card, topic = pass type id, empty payload `{}`. Implemented with `node:http2` directly (no extra dependency). 410 responses delete the registration.

### Google Wallet
- Env: `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_SA_EMAIL`, `GOOGLE_WALLET_SA_KEY_PEM`.
- LoyaltyClass per shop created lazily on first pass request (`id = ${ISSUER_ID}.${shop.id}`), `programName`, `programLogo`, `hexBackgroundColor`, `reviewStatus: UNDER_REVIEW`. Stored in `shops.google_class_id`. Updated (`PATCH`) when shop branding changes.
- LoyaltyObject per card (`id = ${ISSUER_ID}.${card.id}`): `loyaltyPoints { label: "Stamps", balance: { string: "N / M" } }`, `secondaryLoyaltyPoints` for rewards available, `textModulesData` reward text, `barcode { type: QR_CODE, value: card.id, alternateText: short_code }`, `linksModuleData` web-card link.
- Save link: RS256 JWT `{ iss: SA email, aud: 'google', typ: 'savetowallet', payload: { loyaltyObjects: [object] } }` → `https://pay.google.com/gp/v/save/<jwt>`. Uses `jose` for signing. Store `google_object_id` when the save link is generated.
- Updates: `PATCH https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/{id}` using a service-account access token (`google-auth-library`). 404 (never saved) is ignored.
- Issuer starts in demo mode; whitelisted test accounts only until Google approves publishing.

### Web card
`/[slug]/card/[cardId]`: mobile-first; logo, stamp grid, rewards-available badge, QR of `card.id`, short code, "Add to Apple Wallet" / "Add to Google Wallet" buttons, "Email me this card" (stores `email`, sends link via Resend). Sets the `perk_card_<shopId>` cookie. Web-app manifest for add-to-home-screen.

### Landing `/[slug]`
UA detection → iOS: Apple button primary, web card secondary; Android: Google primary, web secondary; desktop: all three + a QR to open on phone. Tapping creates the card (`card_created` event) and issues the pass in one request. If a `perk_card_<shopId>` cookie exists, show "You already have a card — open it" instead of creating a duplicate.

## 6. Stamping and redemption flows

### Barista scan (`/[slug]/staff`)
1. PIN gate (see §4).
2. Scanner view: camera QR reader (`html5-qrcode`) plus a manual "Enter card code" input (short_code).
3. Decoded `card.id` / short_code → server action `lookupCard(shopId, idOrCode)` → card summary panel: stamps `N / M`, rewards available, last stamped.
4. Buttons: **+1 stamp** → `stampCard(shopId, cardId, { source: 'barista_scan', actor: 'staff' })`; **Redeem reward** (enabled when `rewards_available > 0`) → `redeemReward(...)`. Both return the updated card; panel animates the change; "Scan next" resets.
5. Double-tap protection: the +1 button is disabled while the action is in flight; the server also rejects a second `barista_scan` stamp on the same card within 5 seconds (returns the current card with a `duplicate: true` flag rather than an error).

### Customer scan (`/[slug]/scan?t=<token>`)
- Token = `base64url(HMAC-SHA256(qr_secret, slug))`; the printable QR for customer-mode shops encodes this URL. Rotating `qr_secret` (settings) invalidates old posters.
- Page logic (server component):
  1. Verify token; shop must have `stamp_mode = 'customer'` (else show "Ask the barista to stamp your card").
  2. Read `perk_card_<shopId>` cookie. If absent → "Get your card first" → landing (landing preserves `?then=scan` and redirects back after creation so the first visit still yields a stamp).
  3. If `last_stamped_at + cooldown > now` → "Already stamped — come back after HH:MM".
  4. Else `stampCard(shopId, cardId, { source: 'customer_scan' })` → success view with stamp animation and reward-earned celebration if applicable; link to web card.
- Per-IP limit on this route: 20 / hour.
- Redemption in customer mode still happens via `/[slug]/staff` — the owner's phone works as the staff device.

### Domain service (`lib/domain/cards.ts`)
Pure functions over a transaction: `createCard`, `stampCard`, `redeemReward`, `adjustStamps`, `lookupCard`. Each returns `{ card, events }`. `notifyWallets` is invoked by the route/action layer after commit via `waitUntil` from `@vercel/functions` (falls back to awaiting in dev).

## 7. Dashboard

- **Overview:** total cards, stamps today / last 7 days, rewards earned / redeemed (all from `events`), stamp mode badge, "Your customer URL" with copy button, recent 10 events.
- **Customers:** table of cards sorted by `last_stamped_at desc`; search by `short_code` or email; row → drawer with event history and **Adjust** (± stepper + required note) → `adjustStamps(..., { source: 'owner_adjust', actor: ownerId })`.
- **Activity:** paginated `events` (cursor on `id`), filter by type.
- **Settings:** name, logo (upload → Supabase Storage bucket `logos`, public, 512×512 max, PNG/JPG/SVG→PNG), brand colour, stamps required (change applies to future progress; existing `stamps` clamped), reward text, stamp mode, cooldown, **Rotate staff PIN**, **Rotate QR secret**. Slug shown read-only. Saving branding triggers a Google class `PATCH` and marks all shop cards `updated_at = now()` so Apple devices re-fetch.
- **Print:** A5/A4 printable pages — (a) "Get your free-coffee card" poster with landing QR (all shops); (b) "Scan to stamp" poster with the signed scan QR (customer-mode shops); (c) staff card with the staff URL and PIN. CSS `@media print`.

## 8. Error handling

- Domain errors are typed (`CardNotFound`, `CooldownActive`, `NoRewardAvailable`, `InvalidPin`, `InvalidToken`, `RateLimited`) and mapped to friendly UI states; never leak stack traces.
- Wallet provider failures are caught in `notifyWallets`, logged with `shopId/cardId/provider`, and never fail the user action.
- Pass generation failure on the landing page falls back to the web card with a notice.
- All `[slug]` pages 404 for unknown slugs; `/[slug]/card/[cardId]` 404s if the card's `shop_id` doesn't match the slug.

## 9. Testing

- **Unit (Vitest):** `lib/domain/*` against an in-process Postgres (`@electric-sql/pglite` + Drizzle) with the real schema pushed via `drizzle-kit`; covers stamp rollover, stacking rewards, redeem with zero rewards, adjust clamping, cooldown, duplicate-scan guard, tenant scoping (card from shop A not visible via shop B). Token/HMAC helpers, staff cookie signing, rate-limit window logic.
- **Wallet:** `apple.ts` tested for pass.json construction with signing mocked (`passkit-generator` invoked only when certs present; a `WALLET_DRY_RUN` env skips signing and returns the unsigned manifest). `google.ts` tested for object shape and JWT claims using a throwaway RSA key.
- **Integration (Playwright, minimal):** landing → web card → staff PIN → stamp → web card shows updated count. Run against a local Next dev server with pglite-backed DB.
- **Manual checklist** (documented in `docs/manual-testing.md`): real iPhone add-to-wallet, APNs update on stamp, Google demo-mode save, print posters.

## 10. Project layout

```
app/
  (marketing)/page.tsx, login/, onboarding/
  dashboard/{page,customers,activity,settings,print}/
  [slug]/{page,card/[cardId],scan,staff}/
  api/wallet/apple/v1/..., api/cards/[id]/{pass.pkpass,google-save}/
lib/
  db/{schema.ts,client.ts,queries/}
  domain/{cards.ts,errors.ts}
  auth/{config.ts,staff-cookie.ts}
  wallet/{index.ts,apple.ts,google.ts,strip-image.ts}
  security/{hmac.ts,rate-limit.ts}
  storage/logos.ts
components/ ...
drizzle/ (migrations)
tests/ (vitest), e2e/ (playwright)
docs/superpowers/specs/, docs/manual-testing.md
.env.example
```

Stack versions: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Drizzle ORM + `postgres` driver, `next-auth@beta` (v5), `resend`, `passkit-generator`, `jose`, `google-auth-library`, `sharp`, `@resvg/resvg-js`, `html5-qrcode`, `qrcode`, `@vercel/functions`, Vitest, Playwright, `@electric-sql/pglite`.

## 11. Environment variables

```
DATABASE_URL, NEXT_PUBLIC_APP_URL
AUTH_SECRET, AUTH_RESEND_KEY, AUTH_EMAIL_FROM
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_LOGO_BUCKET=logos
STAFF_COOKIE_SECRET
APPLE_TEAM_ID, APPLE_PASS_TYPE_ID, APPLE_PASS_CERT_PEM, APPLE_PASS_KEY_PEM, APPLE_PASS_KEY_PASSPHRASE, APPLE_WWDR_PEM
APNS_KEY_ID, APNS_TEAM_ID, APNS_KEY_PEM
GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SA_EMAIL, GOOGLE_WALLET_SA_KEY_PEM
WALLET_DRY_RUN (dev/test only)
```

## 12. Future (explicitly not v1)

Billing (Stripe) once ≥10 shops; points programs; multi-location; custom domains; rotating on-screen QR for customer-scan mode; customer messaging; queue-backed wallet pushes; Google Wallet callback for save/unsave tracking.
