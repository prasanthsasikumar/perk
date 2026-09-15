import Link from "next/link";
import { CONTACT_EMAIL, LegalPage, Section } from "../legal";

export const metadata = { title: "Terms of service", description: "The terms for shops and customers using Perk." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" intro="These terms cover the use of Perk by shops that run a loyalty programme and by customers who hold a card. By creating a shop or adding a card you agree to them.">
      <Section title="The service">
        <p>Perk provides digital stamp cards that customers can keep in Apple Wallet, Google Wallet or as a web card, along with a dashboard and a staff scanner for shops. Perk is currently free. We may introduce paid plans in future, but we will not start charging an existing shop without at least 30 days&rsquo; notice.</p>
      </Section>

      <Section title="Shops">
        <ul>
          <li>You must be at least 18 and authorised to act for the business you register.</li>
          <li>You are responsible for the programme you configure: the number of stamps, the rewards, and honouring rewards that customers earn. Perk records stamps and rewards; it does not supply the coffee.</li>
          <li>Keep your staff PIN private. Anyone with the PIN can stamp and redeem on your behalf. Rotate it from Settings if it leaks.</li>
          <li>Use the dashboard&rsquo;s adjustment tools honestly. Every correction is logged with your email.</li>
          <li>You must comply with privacy law for the customer data you can see (card history and optional backup emails). Do not export it for marketing without a lawful basis, and do not share it with third parties.</li>
          <li>Your name, logo and colours are shown on cards and passes. You confirm you have the right to use them and that they are not misleading or offensive.</li>
        </ul>
      </Section>

      <Section title="Customers">
        <ul>
          <li>A card belongs to one person. Do not share your card, copy its QR code, or try to stamp it yourself outside the shop&rsquo;s rules.</li>
          <li>Rewards are offered by the shop, not by Perk. Whether a reward is available, what it is, and any conditions (such as one per visit) are set by the shop and may change. Rewards have no cash value.</li>
          <li>If a shop closes its programme, unredeemed rewards may be lost. We encourage shops to give notice, but Perk cannot guarantee it.</li>
        </ul>
      </Section>

      <Section title="Acceptable use">
        <p>Do not use Perk to send spam, to impersonate another business, to scrape or overload the service, to probe its security, or for anything unlawful. We rate-limit and may suspend accounts or cards that abuse the service.</p>
      </Section>

      <Section title="Availability and changes">
        <p>We aim to keep Perk running and passes updating within seconds, but we provide the service &ldquo;as is&rdquo; without a guaranteed uptime. Wallet passes also depend on Apple and Google, which we do not control. We may change or remove features, and we will try to give notice of changes that affect how a programme works.</p>
      </Section>

      <Section title="Data">
        <p>Our <Link className="underline" href="/privacy">privacy policy</Link> explains what we collect and how it is used. Shops can request an export or deletion of their shop data at any time.</p>
      </Section>

      <Section title="Liability">
        <p>To the extent the law allows, Perk is not liable for indirect or consequential loss, lost profits, or the value of rewards that are not honoured. Our total liability to you for anything arising from the service is limited to NZ$100. Nothing in these terms limits rights you have under the Consumer Guarantees Act 1993 or the Fair Trading Act 1986 that cannot be excluded.</p>
      </Section>

      <Section title="Ending things">
        <p>A shop can stop using Perk at any time by emailing us to delete the shop. Customers can remove a pass from their wallet at any time. We may suspend or close a shop that breaches these terms, after contacting the owner where practical.</p>
      </Section>

      <Section title="Governing law and contact">
        <p>These terms are governed by the laws of New Zealand and any dispute will be handled by its courts. Questions go to <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </Section>
    </LegalPage>
  );
}
