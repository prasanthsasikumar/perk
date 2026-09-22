/** Single source of truth for the public-facing identity used across the site and legal pages. */
export const COMPANY = "Juna Design Ltd";
export const CONTACT_EMAIL = "hello@junadesign.co.nz";
export const SOURCE_URL = "https://github.com/prasanthsasikumar/perk";
export const TEASER_URL = "https://youtube.com/shorts/dtcs-cNDu7k";
/** Public hostname of this deployment (from NEXT_PUBLIC_APP_URL), for copy like "host/your-shop". */
export const APP_HOST = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").host;
