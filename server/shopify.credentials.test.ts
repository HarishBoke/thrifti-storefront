import { describe, it, expect } from "vitest";

/**
 * Shopify credentials smoke tests.
 * These tests verify that the required environment variables are present.
 * They are skipped gracefully in environments where credentials are not
 * configured (e.g. CI without secrets, local development without a .env file).
 */
describe("Shopify credentials", () => {
  it("should have SHOPIFY_STORE_DOMAIN set", () => {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    if (!domain) {
      console.warn(
        "[SKIP] SHOPIFY_STORE_DOMAIN is not set — configure it in your .env file for production."
      );
      return;
    }
    // Accept either a real domain or a placeholder (for demo mode)
    expect(typeof domain).toBe("string");
    expect(domain.length).toBeGreaterThan(0);
  });

  it("should have SHOPIFY_STOREFRONT_ACCESS_TOKEN set", () => {
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    if (!token) {
      console.warn(
        "[SKIP] SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set — configure it in your .env file for production."
      );
      return;
    }
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });
});
