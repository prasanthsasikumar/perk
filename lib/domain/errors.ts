export class DomainError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = new.target.name;
  }
}
export class CardNotFound extends DomainError {
  constructor() { super("card_not_found", "We couldn't find that card."); }
}
export class ShopNotFound extends DomainError {
  constructor() { super("shop_not_found", "Shop not found."); }
}
export class CooldownActive extends DomainError {
  constructor(public readonly retryAt: Date) {
    super("cooldown_active", "This card was stamped recently.");
  }
}
export class NoRewardAvailable extends DomainError {
  constructor() { super("no_reward", "No reward available to redeem."); }
}
export class InvalidPin extends DomainError {
  constructor() { super("invalid_pin", "That PIN isn't right."); }
}
export class InvalidToken extends DomainError {
  constructor() { super("invalid_token", "This QR code is no longer valid."); }
}
export class RateLimited extends DomainError {
  constructor() { super("rate_limited", "Too many attempts. Please try again later."); }
}
export class SlugTaken extends DomainError {
  constructor() { super("slug_taken", "That URL is already taken."); }
}
export class InvalidSlug extends DomainError {
  constructor() { super("invalid_slug", "Use 3–40 lowercase letters, numbers or dashes."); }
}

export function isDomainError(e: unknown): e is DomainError {
  return e instanceof DomainError;
}
