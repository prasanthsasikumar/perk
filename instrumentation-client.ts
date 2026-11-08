import posthog from "posthog-js";

// Client pageviews only, cookieless: no cookies or browser storage, no person profiles, so no consent banner.
// No autocapture or session replay; server-side events (lib/analytics.ts) carry the product signals.
if (process.env.NODE_ENV === "production") {
  posthog.init("phc_Dpf2jxsea6e9eukisrHaRe5C7gosREy4bvCzzeFriv73", {
    api_host: "https://us.i.posthog.com",
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24",
    cookieless_mode: "always",
    person_profiles: "never",
    capture_pageview: "history_change",
    autocapture: false,
    disable_session_recording: true,
  });
}
