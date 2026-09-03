import posthog from "posthog-js";

// Client pageviews only. No autocapture or session replay; server-side events carry the product signals.
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    defaults: "2025-05-24",
    autocapture: false,
    capture_pageview: true,
    disable_session_recording: true,
    persistence: "localStorage+cookie",
  });
}
