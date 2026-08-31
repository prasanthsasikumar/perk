import http2 from "node:http2";
import { importPKCS8, SignJWT } from "jose";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { walletRegistrations } from "@/lib/db/schema";
import { getEnv, pemFromEnv } from "@/lib/env";

const APNS_HOST = "https://api.push.apple.com";
let jwtCache: { token: string; at: number } | null = null;

export function isApnsConfigured(): boolean {
  const e = getEnv();
  return Boolean(e.APNS_KEY_ID && e.APNS_TEAM_ID && e.APNS_KEY_PEM);
}

async function providerToken(): Promise<string> {
  if (jwtCache && Date.now() - jwtCache.at < 50 * 60_000) return jwtCache.token;
  const e = getEnv();
  const key = await importPKCS8(pemFromEnv(e.APNS_KEY_PEM)!, "ES256");
  const token = await new SignJWT({}).setProtectedHeader({ alg: "ES256", kid: e.APNS_KEY_ID! }).setIssuer(e.APNS_TEAM_ID!).setIssuedAt().sign(key);
  jwtCache = { token, at: Date.now() };
  return token;
}

/** Send one empty APNs notification; resolves to the HTTP status. */
function sendOne(session: http2.ClientHttp2Session, pushToken: string, topic: string, auth: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = session.request({
      ":method": "POST",
      ":path": `/3/device/${pushToken}`,
      "apns-topic": topic,
      "apns-push-type": "background",
      "apns-priority": "5",
      authorization: `bearer ${auth}`,
      "content-type": "application/json",
    });
    let status = 0;
    req.on("response", (h) => { status = Number(h[":status"] ?? 0); });
    req.on("data", () => {});
    req.on("end", () => resolve(status));
    req.on("error", reject);
    req.end("{}");
  });
}

/** Tell every registered device that this pass changed. Never throws. */
export async function pushToCard(cardId: string): Promise<void> {
  const env = getEnv();
  const regs = await db.select().from(walletRegistrations).where(eq(walletRegistrations.cardId, cardId));
  if (regs.length === 0) return;
  if (env.WALLET_DRY_RUN_BOOL || !isApnsConfigured()) {
    console.log(`[apns] dry-run: would push ${regs.length} device(s) for card ${cardId}`);
    return;
  }
  let session: http2.ClientHttp2Session | null = null;
  try {
    const auth = await providerToken();
    session = http2.connect(APNS_HOST);
    session.on("error", (e) => console.error("[apns] session error", e));
    for (const reg of regs) {
      try {
        const status = await sendOne(session, reg.pushToken, env.APPLE_PASS_TYPE_ID, auth);
        if (status === 410 || status === 400) {
          await db.delete(walletRegistrations).where(and(eq(walletRegistrations.cardId, cardId), eq(walletRegistrations.deviceLibraryId, reg.deviceLibraryId)));
        } else if (status !== 200) {
          console.error(`[apns] push failed status=${status} card=${cardId}`);
        }
      } catch (e) {
        console.error("[apns] push error", { cardId, device: reg.deviceLibraryId }, e);
      }
    }
  } catch (e) {
    console.error("[apns] failed", { cardId }, e);
  } finally {
    session?.close();
  }
}
