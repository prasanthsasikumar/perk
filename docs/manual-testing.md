# Manual testing checklist

Things that need a real device or a real third-party account. Run before each release; tick in a copy of this file.

## Setup
- [ ] `.env` has real `APPLE_*`, `APNS_*`, `GOOGLE_WALLET_*`, `AUTH_RESEND_KEY`, `SUPABASE_*`; `WALLET_DRY_RUN` unset.
- [ ] `NEXT_PUBLIC_APP_URL` is the public HTTPS origin (Apple devices call it back).

## Owner flow
- [ ] `/login` → magic link arrives via Resend → lands on `/onboarding`.
- [ ] Onboarding with a logo upload → logo appears in dashboard settings and on `/<slug>`.
- [ ] Reserved slug (`dashboard`) and duplicate slug are rejected with field errors.
- [ ] Dashboard Print → all three sheets print on A4 with brand colour (background graphics on).

## Apple Wallet (iPhone)
- [ ] `/<slug>` on Safari shows "Add to Apple Wallet" first; tapping opens the pass preview; Add succeeds.
- [ ] Pass shows logo, brand colour, `0 / N` stamps, reward text, QR with the short code as alt text.
- [ ] Device registration row appears in `wallet_registrations`.
- [ ] Staff stamps the card → within ~10 s the pass shows `1 / N` (APNs → device fetch). Check `/api/wallet/apple/v1/log` output if not.
- [ ] Earn a reward → "READY TO REDEEM 1" appears; redeem → disappears.
- [ ] Delete pass from Wallet → registration row removed (DELETE hits web service).

## Google Wallet (Android)
- [ ] Issuer is in demo mode: the test Google account is whitelisted in the Wallet Console.
- [ ] `/<slug>` on Chrome shows "Add to Google Wallet" first; save succeeds; class appears in the console.
- [ ] Stamp → object `loyaltyPoints` updates on the phone.
- [ ] After Google approves publishing: repeat with a non-whitelisted account.

## Web card
- [ ] "Save as web card" → card page; revisit `/<slug>` shows "Welcome back".
- [ ] "Email me this card" → email arrives, link opens the same card on another browser and claims the cookie.
- [ ] Add to Home Screen uses the shop name and colour (manifest).

## Staff & stamping
- [ ] `/<slug>/staff` PIN gate; wrong PIN ×10 → rate-limited message.
- [ ] Camera scan of an Apple pass QR and a Google pass QR both resolve the card.
- [ ] Manual code entry with lowercase and dashes works.
- [ ] Double-tap +1 within 5 s → "Already stamped a moment ago", count unchanged.
- [ ] Rotate PIN in Settings → staff device is bounced to the PIN form.

## Customer-scan mode
- [ ] Switch shop to customer mode; print "Scan to stamp" sheet.
- [ ] Scan without a card → "Get your card first" → get card → redirected back and stamped in one flow.
- [ ] Scan again inside cooldown → "Already stamped… after HH:MM".
- [ ] Rotate stamp QR in Settings → old poster shows "no longer valid".

## Dashboard
- [ ] Customers search by code and by email; adjust −2 with a note → activity shows "Adjusted −2" with owner email.
- [ ] Lower stamps-required below a card's progress → that card is clamped to N−1.
