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

## Brave browser (staff scanner)
- [ ] Open `/<slug>/staff` in Brave on Android and iOS with Shields up (default): either the live camera scans, or the panel explains that Shields blocks the camera and offers **Retry camera** and **Take a photo of the pass**.
- [ ] "Take a photo of the pass" opens the native camera; a photo of an Apple or Google pass QR resolves the card.
- [ ] Typing a card code while the camera preview is open does not restart the camera.

## Tiered rewards
- [ ] Settings → add a bonus reward (e.g. 5 stamps: Free coffee on a 10-stamp card ending in Free gelato) → Save. Landing page, web card, poster and passes list both tiers; milestone cell shows a ring.
- [ ] Stamp a card to 5 → "Reward earned: Free coffee", card keeps counting (5 / 10). Stamp to 10 → "Reward earned: Free gelato", card resets, both rewards listed under "Ready to redeem".
- [ ] Staff scanner shows one **Redeem** button per banked reward kind; redeeming removes only that one. Activity shows the reward name on "Reward earned" and "Redeemed" rows.
- [ ] Apple pass "READY TO REDEEM" shows names (e.g. "Free coffee · Free gelato"); Google pass text module "Ready to redeem" matches.
- [ ] Customers → adjust +12 on a fresh tiered card → 2 / 10 with both rewards banked.

## Card templates
- [ ] Settings → Card template → pick Stars / Hearts / Coffee cups → Save. Web card, staff scanner and a re-fetched Apple pass strip use the new icon.

## Legal pages
- [ ] `/privacy` and `/terms` render; linked from the marketing footer, the login page, the dashboard sidebar and the customer card footer.
