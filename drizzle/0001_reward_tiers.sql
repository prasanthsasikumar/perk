ALTER TABLE "cards" ADD COLUMN "pending_rewards" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "reward_tiers" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "stamp_style" text DEFAULT 'check' NOT NULL;--> statement-breakpoint
UPDATE "cards" c
SET "pending_rewards" = (
  SELECT coalesce(jsonb_agg(s."reward_text"), '[]'::jsonb)
  FROM "shops" s, generate_series(1, c."rewards_available")
  WHERE s."id" = c."shop_id"
)
WHERE c."rewards_available" > 0;
