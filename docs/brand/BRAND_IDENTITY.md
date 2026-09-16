# Perk — Complete Visual Identity & Brand System

We retain the burnt orange lineage (`#C95A2B`, Stamp Rust) and eliminate the plum theme entirely. Plum functions like a consumer SaaS brand (Figma, Loom), which actively clashes with café identities and feels overly synthetic. Stamp Rust evokes physical ink pads, print press marks, and industrial paper utility without falling into café clichés like coffee-bean browns or steam curls. The core application frame re-anchors to high-contrast monochrome paper (`#121212` ink, `#F9F9FB` background, `#E5E5E5` borders), keeping Stamp Rust strictly isolated to system operational status, stamp highlights, and primary CTA triggers.

---

## 1. Positioning Line & Attributes

**Positioning Line**
Zero-friction digital loyalty infrastructure for independent cafés—invisible in the phone wallet, instant at the till.

**Brand Attributes**
* **Low-Ego Framing**: We render system UI in neutral monochrome paper tones; we never force Perk branding onto customer-facing café assets.
* **Ledger Precision**: We expose exact timestamps and append-only audit histories; we never treat loyalty state as an opaque, fluctuating counter.
* **Tactile Speed**: We build high-contrast targets for one-handed 2-second barista interactions; we never introduce navigation drawers, marketing popups, or multi-step forms.

---

## 2. Logo

**Construction & Geometry**
The standalone mark is constructed on a 100×100 viewBox grid. It features an outer rounded square container (`rect` at `x=10`, `y=10`, `width=80`, `height=80`, corner radius `rx=16`) representing a stamp block, with a negative-space geometric 'P' punched cleanly through the center. The stem of the 'P' spans `x=30` to `x=44`, `y=26` to `y=74`. The loop of the 'P' extends to `x=70` with an outer radius of `r=18` centered at `(52, 44)` and an inner cutout radius of `r=7`.

```xml
<!-- Primary Standalone Mark (100x100 ViewBox) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10 26C10 17.1634 17.1634 10 26 10H74C82.8366 10 90 17.1634 90 26V74C90 82.8366 82.8366 90 74 90H26C17.1634 90 10 82.8366 10 74V26ZM30 26H52C61.9411 26 70 34.0589 70 44C70 53.9411 61.9411 62 52 62H44V74H30V26ZM44 37V51H52C55.866 51 59 47.866 59 44C59 40.134 55.866 37 52 37H44Z" fill="currentColor"/>
</svg>
```

**Responsive Simplification**
* **Apple Wallet Pass Icon (29×29 px)**: The inner cutout of the loop drops to a solid geometric silhouette, and the outer corner radius scales to `4px` to prevent sub-pixel blur.
* **Favicon (16×16 px)**: The outer bounding container is removed; the mark renders solely as a solid flat-fill 'P' punch silhouette with 1px outer optical padding.

**Rules**
* **Colour Execution**: Rendered exclusively in flat single-color (Stamp Rust `#C95A2B`, Ink Primary `#121212`, or knocked-out `#FFFFFF`). Gradients, drop shadows, and multi-tone fills are disallowed.
* **Clear Space**: Minimum clear space on all sides equals `1X`, where `X` is the width of the main vertical stem (14px on a 100px grid).
* **Minimum Size**: Digital screen display minimum is `14×14 px`. Print minimum is `4×4 mm`.

---

## 3. Colour

| Name | Hex Value | Role | WCAG AA Ratio (on Base) | Placement Safety Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Stamp Rust** | `#C95A2B` | Brand Highlight / Active Punch | 4.6:1 (on White/Paper) | System UI only; **Never** place inside café header zones. |
| **Ink Primary** | `#121212` | Headings, Primary Text, Dark UI | 19.3:1 (on White) | Safe adjacent to any neutral surface. |
| **Ink Secondary** | `#525252` | Subtitles, Form Labels, Borders | 7.0:1 (on White) | Safe adjacent to white/paper surfaces. |
| **Ink Muted** | `#737373` | Captions, Timestamps, Table Data | 4.6:1 (on White) | Use only on `#FFFFFF` or `#F9F9FB`. |
| **Hairline** | `#E5E5E5` | Structural Rules, Card Outlines | N/A (UI Boundary) | Structural divider only. |
| **Surface Base** | `#FFFFFF` | Core Canvas, Poster Surface | 1.0:1 (Base) | Safe background for all elements. |
| **Surface Muted** | `#F9F9FB` | Dashboard Cards, Table Headers | 1.05:1 (vs White) | Safe background for neutral cards. |
| **Success** | `#15803D` | Valid Scans, Redeemed Status | 4.7:1 (on White) | Internal app alerts only. |
| **Danger** | `#B91C1C` | Errors, Revoked Stamps | 5.9:1 (on White) | Internal app alerts only. |

---

## 4. Typography

Primary typography relies on **Space Grotesk** (Headings) and **Rethink Sans** (UI/Body), paired with **JetBrains Mono** for numerical values and system codes. All digits use tabular layout (`font-variant-numeric: tabular-nums`) to ensure zero layout shift when stamp counters update live.

| Level | Size / Line Height | Weight | Tracking | Font Family | Google Fonts Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero** | 48px / 52px | 700 (Bold) | -0.03em | Space Grotesk | Available |
| **Section Heading** | 24px / 30px | 600 (SemiBold) | -0.02em | Space Grotesk | Available |
| **Card Title** | 18px / 24px | 600 (SemiBold) | -0.01em | Rethink Sans | Available |
| **Body** | 15px / 22px | 400 (Regular) | 0.00em | Rethink Sans | Available |
| **Label** | 13px / 16px | 500 (Medium) | +0.01em | Rethink Sans | Available |
| **Caption / Mono** | 12px / 16px | 500 (Medium) | +0.02em | JetBrains Mono | Available |

---

## 5. The Stamp

The stamp is Perk’s core operational primitive. It represents physical ink pressed onto cardstock.

* **Filled Stamp**: A solid outer circle with a concentric inner geometric punch star (`polygon` cross-star cutout), signaling completed verification.
* **Empty Stamp**: A hairline outer circle (`stroke-width: 2px`, `#E5E5E5`) containing a subtle centered coordinate crosshair (`#737373`), signaling an available slot.

```xml
<!-- Filled Stamp (50x50 ViewBox) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50" fill="none">
  <circle cx="25" cy="25" r="22" fill="#C95A2B"/>
  <path d="M25 13L28.5 21.5L37 25L28.5 28.5L25 37L21.5 28.5L13 25L21.5 21.5L25 13Z" fill="#FFFFFF"/>
</svg>

<!-- Empty Stamp (50x50 ViewBox) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50" fill="none">
  <circle cx="25" cy="25" r="21" stroke="#E5E5E5" stroke-width="2"/>
  <path d="M25 18V32M18 25H32" stroke="#737373" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

**Surface Scaling Rules**
* **375×123 pt Wallet Pass Strip**: Displayed as a 2×5 horizontal grid. Each stamp circle is 32×32 pt with 8 pt padding.
* **A4 Counter Poster**: Displayed as a single 1×10 horizontal bar across the bottom margin. Stamps render at 44×44 mm size with 4px borders.
* **20 px Dashboard Table Row**: Replaced by a compact text tag using JetBrains Mono (`7 / 10`) paired with a single 14×14 px Filled Stamp inline icon.

---

## 6. Voice

1. **State facts, drop adjectives**: Describe operations directly without describing how the user should feel about them.
2. **Use active technical verbs**: Write "Scanned", "Stamped", "Issued"—never passive descriptions.
3. **No conversational filler**: Eliminate greetings, sign-offs, and polite buffer phrases.
4. **Enforce short declarative sentences**: Limit statements to single independent clauses.
5. **No punctuation gimmicks**: Avoid exclamation marks, em-dashes, and ellipses.

* **Before**: "Loyalty cards that live right inside your customer's favourite mobile wallet!"  
  **After**: Digital stamp cards in Apple Wallet and Google Wallet.

* **Before**: "Your regulars, recognized — build deeper relationships with every single cup."  
  **After**: Identify regulars at the register.

* **Before**: "A ledger, not a counter — keeping your rewards 100% accurate and tamper-proof."  
  **After**: Every stamp is a timestamped ledger entry.

* **Before**: "Awesome! You've successfully added 1 stamp to Sarah's card."  
  **After**: Stamp added. Current balance: 8 / 10.

* **Before**: "Oops, it looks like that PIN didn't quite work. Please try typing it again!"  
  **After**: Incorrect PIN. Try again.

---

## 7. Applied to Five Real Surfaces

**1. Apple / Google Wallet Pass**
* **Header Zone**: Features the café's custom background color and primary logo SVG. Perk branding is 0% visible here.
* **Strip Area (375×123 pt)**: Displays the 10-stamp grid (2 rows of 5). Filled stamps use the café's brand color; empty stamps render with hairline gray borders.
* **Secondary Field**: Text reading `REWARD: FREE FLAT WHITE` using system font, medium weight.
* **Footer**: Centered QR code for barista scanning, flanked by the pass serial ID in JetBrains Mono.

**2. A4 Counter Poster**
* **Top 70%**: Café logo prominently displayed at 120mm width above a high-contrast 160×160mm QR code.
* **Middle Text**: Headline in Space Grotesk Bold (36 pt): "Scan to add loyalty card." Subtext: "No app download required."
* **Bottom Bar**: Single 1×10 stamp preview bar anchored above a minimal footline: `Powered by getperk.app` rendered in 10 pt Ink Muted (`#737373`).

**3. Marketing Homepage Hero**
* **Layout**: Asymmetric two-column split on Surface Base (`#FFFFFF`) with a 1px Hairline (`#E5E5E5`) grid overlay.
* **Left Column**: Hero text in Space Grotesk Bold (48 pt): "Digital loyalty for independent coffee shops." Primary CTA button: Full-radius pill in Ink Primary (`#121212`) reading "Create your shop pass". Secondary link: "View open-source ledger".
* **Right Column**: Ultra-clean CSS rendering of a live mobile wallet pass inside a neutral device frame, showing live stamp state toggles.

**4. Magic-Link Sign-In Email**
* **Frame**: Flat `#F9F9FB` background with a centered 480px white card container bordered by `#E5E5E5`.
* **Header**: Perk wordmark rendered at 20px height in `#121212`.
* **Body**: Single line in Rethink Sans: "Click the button below to sign in to your Perk dashboard."
* **CTA**: Solid `#121212` rectangular block button with 6px border radius: "Sign in to Dashboard".
* **Footer**: Monospace text: "Link expires in 15 minutes. If you did not request this, ignore this email."

**5. Barista Phone Scanner Screen**
* **Viewport**: Optimized for single-thumb execution under high ambient sunlight. High contrast `#121212` background.
* **Top 40%**: Active camera viewfinder viewport wrapped in a 2px `#C95A2B` border.
* **Bottom 60%**: Instant action sheet triggered upon scan:
  - Customer Name / ID header in 20pt Space Grotesk (`#FFFFFF`).
  - Current balance display: Large `7 / 10` readout in JetBrains Mono (40pt).
  - Primary Action: Full-width 64px tall button in Stamp Rust (`#C95A2B`) reading "+1 STAMP".
  - Secondary Action: Outline button reading "REDEEM REWARD (10)".

---

## 8. Anti-Patterns

1. Perk identity elements must never overlay, clip, or tint a café's uploaded logo or brand color.
2. The UI must never use illustrations of coffee cups, steam vectors, coffee beans, or kraft paper textures.
3. The app must never display popups, onboarding carousels, or rate-us modals to customers receiving a stamp.
4. Color gradients must never be used on any button, background, mark, or stamp surface.
5. System typography must never rely on un-cached font files or display text without numeric tabular spacing.
6. The product copy must never use decorative punctuation, conversational greetings, or marketing jargon.

---

## 9. Implementation notes (as built)

Three places where the code deviates from the sections above, and why. Live tokens are in `app/globals.css`.

1. **Stamp Rust measures 4.22:1 on white, not 4.6:1** (section 3 overstates it). It therefore fails WCAG AA for
   text under 18.66px bold / 24px regular. Fills, the mark and large type use `--accent` `#C95A2B`; accent text at
   body size and below uses `--accent-strong` `#B85024` (4.99:1). Verified ratios for the rest of the palette:
   Ink Primary 18.73:1, Ink Secondary 7.81:1, Ink Muted 4.74:1, Success 5.02:1, Danger 6.47:1.
2. **Empty stamps use Ink Muted `#737373`, not Hairline `#E5E5E5`.** Both the Apple strip and the web grid draw the
   slots on a white panel, where a `#E5E5E5` ring (1.26:1) all but disappears at arm's length on a phone. A row of ten
   open slots is the thing a customer actually reads, so it gets the stronger neutral. `lib/wallet/strip-image.ts`,
   `components/stamp-grid.tsx`.
3. **The pass `icon`/`logo` fallbacks are the white-knockout mark, not Stamp Rust.** Those images sit on the shop's
   own `brandColor`, which section 8 rule 1 puts off limits to Perk's colour. `public/perk-mark-white.svg`,
   generated by `scripts/gen-pass-assets.ts`.

**Not applied:** section 5's fixed star/crosshair stamp geometry. Shops pick their own stamp icon
(`lib/stamp-icons.ts`: tick, star, heart, cup) and filled stamps take the shop's colour, which is the same
low-ego principle the brand argues for. Section 8 rule 2's ban on coffee-cup imagery governs Perk's own chrome,
not a café's choice of stamp.
