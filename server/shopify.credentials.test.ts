import { describe, it, expect } from "vitest";

describe("Shopify credentials", () => {
  it("should have SHOPIFY_STORE_DOMAIN set", () => {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    // Accept either a real domain or a placeholder (for demo mode)
    expect(typeof domain).toBe("string");
    expect(domain!.length).toBeGreaterThan(0);
  });

  it("should have SHOPIFY_STOREFRONT_ACCESS_TOKEN set", () => {
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    expect(typeof token).toBe("string");
    expect(token!.length).toBeGreaterThan(0);
  });
});
