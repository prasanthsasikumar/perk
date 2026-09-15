import Link from "next/link";
import { CONTACT_EMAIL, LegalPage, Section } from "../legal";

export const metadata = { title: "Privacy policy", description: "What Perk collects, why, and how to get it removed." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" intro="Perk is a small, free loyalty-card service run from New Zealand. This page explains what we collect from shops and their customers, why, who else sees it, and how to have it removed.">
      <Section title="Who we are">
        <p>Perk (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated by Prasanth Sasikumar in Auckland, New Zealand. We are the data controller for the Perk service. You can reach us at <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        <p>Each shop that uses Perk is responsible for its own loyalty programme. When a shop stamps your card, the shop is the party you have a relationship with; we process the data on the shop&rsquo;s behalf and under this policy.</p>
      </Section>

      <Section title="What we collect from customers">
        <p>Stamp cards are anonymous by default. When you add a card we create a random card ID and an eight-character card code. We do not ask for your name, phone number or an account.</p>
        <ul>
          <li><strong>Stamps and rewards.</strong> Each stamp, reward and redemption is recorded against your card with a timestamp and the source (staff scan, counter QR or an owner correction). The shop can see this history.</li>
          <li><strong>Email address (optional).</strong> If you use &ldquo;Back up this card&rdquo; we store the address you enter so we can email you your card link. The shop can see this address next to your card.</li>
          <li><strong>Wallet passes.</strong> If you add the card to Apple Wallet, Apple sends us a device identifier and a push token so we can update the pass when you are stamped. For Google Wallet we store the pass object ID that Google assigns. These identify a device or a pass, not you.</li>
          <li><strong>Cookies.</strong> A cookie on the shop&rsquo;s page remembers which card is yours so you are not issued a second one. It holds only the card ID and lasts up to a year.</li>
          <li><strong>Technical data.</strong> Our servers see your IP address and browser type with each request. We use the IP address for rate limiting (for example, to stop someone issuing hundreds of cards). Page views are counted with PostHog analytics if it is enabled for a deployment; we do not use session recording or autocapture.</li>
        </ul>
      </Section>

      <Section title="What we collect from shop owners">
        <ul>
          <li><strong>Email address</strong> for magic-link sign-in. We never store a password.</li>
          <li><strong>Shop details</strong> you enter: name, URL slug, logo, colours, reward settings, and the staff PIN for your scanner page.</li>
          <li><strong>Activity</strong> such as stamps, redemptions and adjustments you make, which appear in your dashboard ledger with your email as the actor for adjustments.</li>
          <li><strong>Product analytics</strong> about how the dashboard is used (for example that a shop was created or a poster printed). These events are tied to your shop, not to individual customers.</li>
        </ul>
      </Section>

      <Section title="Why we use it">
        <p>We use this information only to run the loyalty programme: issue cards, record stamps, update wallet passes, send the emails you ask for, show shops their own customers&rsquo; activity, keep the service secure, and understand which features are used. We do not sell data, build advertising profiles, or share customer data between shops.</p>
      </Section>

      <Section title="Who else processes it">
        <p>We rely on a small number of service providers, each of which only receives what it needs to do its job:</p>
        <ul>
          <li><strong>Vercel</strong> hosts the application and serves requests.</li>
          <li><strong>A managed PostgreSQL database</strong> stores shops, cards and events.</li>
          <li><strong>Supabase Storage</strong> holds shop logos.</li>
          <li><strong>Resend</strong> delivers sign-in and card-link emails.</li>
          <li><strong>Apple</strong> (Apple Wallet and push notifications) and <strong>Google</strong> (Google Wallet) deliver and update passes. Their own privacy policies apply to what they do with passes on your device.</li>
          <li><strong>PostHog</strong> counts page views and product events, when enabled.</li>
        </ul>
        <p>Some of these providers store data outside New Zealand (in Australia, India, Europe or the United States). We choose providers that commit to appropriate safeguards for that data.</p>
      </Section>

      <Section title="How long we keep it">
        <ul>
          <li>Cards, stamps and reward history are kept while the shop&rsquo;s programme exists, so that your card keeps working. If a shop is deleted, its cards and history are deleted with it.</li>
          <li>Wallet registrations are deleted when you remove the pass from your wallet.</li>
          <li>Rate-limit counters are kept for the length of the limit window (at most a few hours).</li>
          <li>Sign-in tokens expire within 24 hours; sessions expire after 30 days of inactivity.</li>
        </ul>
      </Section>

      <Section title="Your rights">
        <p>Under the New Zealand Privacy Act 2020 (and the GDPR if you are in the EU or UK) you can ask us to tell you what we hold about you, correct it, or delete it. Because cards are anonymous, we may ask you for your card code or the email you used for backup so we can find your card.</p>
        <p>You can delete your own card at any time by removing the pass from your wallet and clearing the shop&rsquo;s cookie; ask us or the shop to delete the card&rsquo;s history. Shop owners can ask us to delete their shop and all of its data.</p>
        <p>Email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for any of these. If you are not happy with our response you can complain to the <a className="underline" href="https://www.privacy.org.nz" rel="noreferrer">Office of the Privacy Commissioner</a>.</p>
      </Section>

      <Section title="Security">
        <p>All traffic uses HTTPS. Staff scanner access is protected by a per-shop PIN and a signed cookie; counter QR codes are signed so they cannot be forged; wallet endpoints authenticate with per-card tokens. We keep access to the production database to the people who run the service.</p>
      </Section>

      <Section title="Children">
        <p>Perk is intended for shops and their adult customers. We do not knowingly collect data from children under 16 and will delete it if we learn we have.</p>
      </Section>

      <Section title="Changes">
        <p>If we change this policy in a way that matters, we will update the date at the top and, for shop owners, mention it in the dashboard. Continued use after a change means you accept the updated policy.</p>
        <p>See also our <Link className="underline" href="/terms">terms of service</Link>.</p>
      </Section>
    </LegalPage>
  );
}
