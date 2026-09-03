import { PostHog } from "posthog-node";
import { waitUntil } from "@vercel/functions";

export type CaptureEvent = {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
  groups?: Record<string, string>;
};
export type CaptureClient = { capture(e: CaptureEvent): void; flush?(): Promise<void> };
export type TrackOpts = { shopSlug?: string; distinctId?: string };
export type Track = (event: string, properties?: Record<string, unknown>, opts?: TrackOpts) => void;

/** Build a tracker over any capture client. `null` yields a silent no-op (dev, tests, PostHog not configured). */
export function makeTracker(client: CaptureClient | null): Track {
  return (event, properties = {}, opts = {}) => {
    if (!client) return;
    try {
      const shop = opts.shopSlug;
      client.capture({
        distinctId: opts.distinctId ?? (shop ? `shop:${shop}` : "anonymous"),
        event,
        properties: shop ? { ...properties, shop } : properties,
        ...(shop ? { groups: { shop } } : {}),
      });
      if (client.flush) {
        const p = client.flush().catch((e) => console.error("[analytics] flush", e));
        try {
          waitUntil(p);
        } catch {
          /* outside a request context: let it run detached */
        }
      }
    } catch (e) {
      console.error("[analytics] capture", e);
    }
  };
}

function clientFromEnv(): CaptureClient | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  return new PostHog(key, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com", flushAt: 1, flushInterval: 0 });
}

/** Product analytics. No-op unless NEXT_PUBLIC_POSTHOG_KEY is set. */
export const track: Track = makeTracker(clientFromEnv());
