# Perk

Digital loyalty stamp cards for coffee shops — in Apple Wallet and Google Wallet.

Shops sign up, configure their stamp card, and get a URL like `perk.app/<shop>`. Customers tap once to add the card to their wallet; baristas scan to stamp and redeem.

## Status

Design phase. See `docs/superpowers/specs/` for the design spec.

## Stack (planned)

Next.js (App Router) on Vercel · Drizzle + Supabase Postgres · Supabase Storage · Auth.js magic links via Resend · `passkit-generator` (Apple Wallet) · Google Wallet Objects API
