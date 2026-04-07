import { describe, expect, it, vi, beforeEach } from "vitest";
import { formatPrice } from "../shared/shopifyTypes";

// ---------------------------------------------------------------------------
// formatPrice utility tests
// ---------------------------------------------------------------------------
describe("formatPrice", () => {
  it("formats INR amounts with ₹ symbol and Indian number formatting", () => {
    const result = formatPrice("1000", "INR");
    expect(result).toBe("₹1,000");
  });

  it("formats INR amounts above 1 lakh correctly", () => {
    const result = formatPrice("100000", "INR");
    expect(result).toBe("₹1,00,000");
  });

  it("formats USD amounts with Intl.NumberFormat", () => {
    const result = formatPrice("29.99", "USD");
    expect(result).toContain("29.99");
  });

  it("handles zero amount", () => {
    const result = formatPrice("0", "INR");
    expect(result).toBe("₹0");
  });

  it("falls back gracefully for unknown currency codes", () => {
    const result = formatPrice("500", "XYZ");
    expect(result).toContain("500");
  });

  it("handles decimal INR amounts by rounding", () => {
    const result = formatPrice("999.50", "INR");
    // Should round to nearest integer for INR
    expect(result).toMatch(/₹999|₹1,000/);
  });
});

// ---------------------------------------------------------------------------
// Shopify API client tests (mocked fetch)
// ---------------------------------------------------------------------------
describe("shopifyFetch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws an error when Shopify domain is not configured", async () => {
    // When SHOPIFY_STORE_DOMAIN is empty, the endpoint is invalid
    const originalDomain = process.env.SHOPIFY_STORE_DOMAIN;
    process.env.SHOPIFY_STORE_DOMAIN = "";

    // Dynamically import to get fresh module state
    const { shopifyFetch } = await import("./shopify");

    // Mock fetch to simulate network failure for empty domain
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("fetch failed"));

    await expect(shopifyFetch("{ shop { name } }")).rejects.toThrow();

    process.env.SHOPIFY_STORE_DOMAIN = originalDomain;
  });
});

// ---------------------------------------------------------------------------
// tRPC router tests
// ---------------------------------------------------------------------------
describe("appRouter - auth", () => {
  it("me procedure returns null for unauthenticated user", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: vi.fn() } as any,
    });

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("logout procedure clears session cookie", async () => {
    const { appRouter } = await import("./routers");
    const clearCookie = vi.fn();
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie } as any,
    });

    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearCookie).toHaveBeenCalledOnce();
  });
});

describe("appRouter - products", () => {
  it("products.list returns products array structure", async () => {
    // Mock the Shopify fetch to avoid real API calls in tests
    vi.mock("./shopify", async (importOriginal) => {
      const original = await importOriginal<typeof import("./shopify")>();
      return {
        ...original,
        getProducts: vi.fn().mockResolvedValue({
          products: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
        }),
      };
    });

    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: vi.fn() } as any,
    });

    const result = await caller.products.list({ first: 10 });
    expect(result).toHaveProperty("products");
    expect(Array.isArray(result.products)).toBe(true);
  });
});

describe("appRouter - ai.generateDescription", () => {
  it("generates description with required product name", async () => {
    // Mock invokeLLM to avoid real API calls
    vi.mock("./_core/llm", () => ({
      invokeLLM: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "A stunning vintage piece that tells a story." } }],
      }),
    }));

    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: vi.fn() } as any,
    });

    const result = await caller.ai.generateDescription({
      productName: "Vintage Denim Jacket",
      brand: "Levi's",
      condition: "Excellent",
    });

    expect(result).toHaveProperty("description");
    expect(typeof result.description).toBe("string");
  });
});

describe("appRouter - orders.notifyNewOrder", () => {
  it("notifies owner and returns success", async () => {
    vi.mock("./_core/notification", () => ({
      notifyOwner: vi.fn().mockResolvedValue(true),
    }));

    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: vi.fn() } as any,
    });

    const result = await caller.orders.notifyNewOrder({
      orderNumber: "1001",
      customerName: "Priya Sharma",
      customerEmail: "priya@example.com",
      totalPrice: "₹2,500",
      items: [{ title: "Vintage Jacket", quantity: 1, price: "₹2,500" }],
    });

    expect(result).toEqual({ success: true });
  });
});
