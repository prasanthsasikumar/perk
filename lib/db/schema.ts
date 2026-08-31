import {
  pgTable, text, uuid, integer, timestamp, bigserial, primaryKey, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const STAMP_MODES = ["barista", "customer"] as const;
export type StampMode = (typeof STAMP_MODES)[number];

export const shops = pgTable("shops", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color").notNull().default("#1f1f1f"),
  stampsRequired: integer("stamps_required").notNull().default(10),
  rewardText: text("reward_text").notNull().default("Free coffee"),
  stampMode: text("stamp_mode", { enum: STAMP_MODES }).notNull().default("barista"),
  customerScanCooldownMin: integer("customer_scan_cooldown_min").notNull().default(15),
  programType: text("program_type", { enum: ["stamps"] }).notNull().default("stamps"),
  staffPin: text("staff_pin").notNull(),
  staffPinVersion: integer("staff_pin_version").notNull().default(1),
  qrSecret: text("qr_secret").notNull(),
  googleClassId: text("google_class_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const owners = pgTable("owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shopOwners = pgTable(
  "shop_owners",
  {
    shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull().references(() => owners.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.shopId, t.ownerId] })],
);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
    shortCode: text("short_code").notNull(),
    stamps: integer("stamps").notNull().default(0),
    rewardsAvailable: integer("rewards_available").notNull().default(0),
    email: text("email"),
    appleAuthToken: text("apple_auth_token").notNull(),
    googleObjectId: text("google_object_id"),
    lastStampedAt: timestamp("last_stamped_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("cards_shop_short_code").on(t.shopId, t.shortCode),
    index("cards_shop_last_stamped").on(t.shopId, t.lastStampedAt),
  ],
);

export const EVENT_TYPES = ["card_created", "stamp", "reward_earned", "redeem", "adjust"] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export const EVENT_SOURCES = ["barista_scan", "customer_scan", "owner_adjust", "system"] as const;
export type EventSource = (typeof EVENT_SOURCES)[number];

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
    cardId: uuid("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
    type: text("type", { enum: EVENT_TYPES }).notNull(),
    delta: integer("delta").notNull().default(0),
    source: text("source", { enum: EVENT_SOURCES }).notNull(),
    actor: text("actor"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("events_shop_created").on(t.shopId, t.createdAt),
    index("events_card_created").on(t.cardId, t.createdAt),
  ],
);

export const walletRegistrations = pgTable(
  "wallet_registrations",
  {
    deviceLibraryId: text("device_library_id").notNull(),
    cardId: uuid("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
    pushToken: text("push_token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.deviceLibraryId, t.cardId] })],
);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

// ---- Auth.js tables (shape required by @auth/drizzle-adapter) ----
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => [primaryKey({ columns: [a.provider, a.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Owner = typeof owners.$inferSelect;
export type WalletRegistration = typeof walletRegistrations.$inferSelect;
