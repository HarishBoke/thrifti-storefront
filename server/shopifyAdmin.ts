import { ENV } from "./_core/env";

const ADMIN_API_VERSION = "2024-01";

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const domain = ENV.shopifyStoreDomain;
  const token = ENV.shopifyAdminToken;

  if (!domain || !token) {
    throw new Error("Shopify Admin API credentials not configured");
  }

  const res = await fetch(
    `https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!res.ok) {
    throw new Error(`Shopify Admin API HTTP error: ${res.status}`);
  }

  const json = (await res.json()) as { data: T; errors?: { message: string }[] };

  if (json.errors?.length) {
    throw new Error(`Shopify Admin API error: ${json.errors[0].message}`);
  }

  return json.data;
}

// ── Set app.role = 'seller' metafield + 'seller' tag on a new customer ────────
/**
 * Called immediately after customerCreate (Storefront API) succeeds.
 * Uses the Admin API to:
 *   1. Append the `seller` tag to the customer.
 *   2. Set the `app.role` metafield to `seller` (single_line_text_field).
 *
 * The Storefront API cannot write protected metafields, so this MUST run
 * server-side using the Admin access token — never exposed to the browser.
 *
 * @param customerGid  Shopify customer GID, e.g. "gid://shopify/Customer/12345"
 */
export async function setCustomerSellerRole(customerGid: string): Promise<void> {
  await adminFetch<{
    customerUpdate: { userErrors: { field: string[]; message: string }[] };
    metafieldsSet: { userErrors: { field: string[]; message: string }[] };
  }>(
    `mutation SetSellerRole($customerId: ID!, $tags: [String!]!, $metafields: [MetafieldsSetInput!]!) {
      customerUpdate(input: { id: $customerId, tags: $tags }) {
        customer { id tags }
        userErrors { field message }
      }
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key value }
        userErrors { field message }
      }
    }`,
    {
      customerId: customerGid,
      tags: ["seller"],
      metafields: [
        {
          ownerId: customerGid,
          namespace: "app",
          key: "role",
          value: "seller",
          type: "single_line_text_field",
        },
      ],
    }
  );
}

// ── Find a customer by phone number (Admin REST API) ────────────────────────────
/**
 * Looks up a Shopify customer by phone number using the Admin REST API.
 * Returns the customer's numeric ID and email, or null if not found.
 */
export async function getCustomerByPhone(
  phone: string
): Promise<{ id: number; email: string | null; phone: string } | null> {
  const domain = ENV.shopifyStoreDomain;
  const token = ENV.shopifyAdminToken;
  if (!domain || !token) throw new Error("Shopify Admin API credentials not configured");

  const res = await fetch(
    `https://${domain}/admin/api/${ADMIN_API_VERSION}/customers/search.json?query=phone:${encodeURIComponent(phone)}&limit=1`,
    { headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Shopify Admin REST error: ${res.status}`);
  const json = (await res.json()) as { customers: { id: number; email: string | null; phone: string }[] };
  return json.customers?.[0] ?? null;
}

// ── Set a temporary password on a customer (Admin REST API) ──────────────────
/**
 * Sets a temporary password on a Shopify customer via the Admin REST API.
 * Used during OTP login to generate a short-lived credential that the
 * Storefront API can use to issue a customer access token.
 *
 * Customers created by the WhatsApp bot may have no email address (state: disabled).
 * Shopify requires an email to set a password, so we auto-generate a deterministic
 * placeholder email (phone.{digits}@thrifti.store) in that case.
 *
 * The password is immediately overwritten after login, so it is never
 * a permanent credential.
 *
 * @returns The email used to log in (real or generated placeholder)
 */
export async function setCustomerTempPassword(
  customerId: number,
  tempPassword: string,
  existingEmail: string | null,
  phone: string
): Promise<string> {
  const domain = ENV.shopifyStoreDomain;
  const token = ENV.shopifyAdminToken;
  if (!domain || !token) throw new Error("Shopify Admin API credentials not configured");

  // If the customer has no email, auto-assign a deterministic placeholder.
  // Format: phone.{digits}@thrifti.store  (e.g. phone.919845461242@thrifti.store)
  const loginEmail =
    existingEmail ??
    `phone.${phone.replace(/\D/g, "")}@thrifti.store`;

  const customerPayload: Record<string, unknown> = {
    id: customerId,
    password: tempPassword,
    password_confirmation: tempPassword,
  };
  if (!existingEmail) {
    customerPayload.email = loginEmail;
  }

  const res = await fetch(
    `https://${domain}/admin/api/${ADMIN_API_VERSION}/customers/${customerId}.json`,
    {
      method: "PUT",
      headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ customer: customerPayload }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shopify Admin REST error setting password (${res.status}): ${body}`);
  }
  return loginEmail;
}

// ── Get current view count for a product ─────────────────────────────────────
export async function getProductViewCount(productGid: string): Promise<number> {
  const data = await adminFetch<{
    product: { metafield: { value: string } | null };
  }>(
    `query GetViewCount($id: ID!) {
      product(id: $id) {
        metafield(namespace: "thrifti", key: "view_count") {
          value
        }
      }
    }`,
    { id: productGid }
  );

  const raw = data?.product?.metafield?.value;
  return raw ? parseInt(raw, 10) : 0;
}

// ── Increment view count for a product ───────────────────────────────────────
export async function incrementProductViewCount(productGid: string): Promise<number> {
  const current = await getProductViewCount(productGid);
  const next = current + 1;

  await adminFetch<{ metafieldsSet: { userErrors: { message: string }[] } }>(
    `mutation SetViewCount($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key value }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId: productGid,
          namespace: "thrifti",
          key: "view_count",
          value: String(next),
          type: "number_integer",
        },
      ],
    }
  );

  return next;
}

// ── Wishlist via app.wishlist metafield (JSON array of WishlistItem) ──────────
export interface WishlistItem {
  productId: string;
  productHandle: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: string;
  addedAt: string; // ISO date string
}

/**
 * Read the wishlist for a customer from the app.wishlist metafield.
 * @param customerGid  e.g. "gid://shopify/Customer/12345"
 */
export async function getWishlist(customerGid: string): Promise<WishlistItem[]> {
  const data = await adminFetch<{
    customer: { metafield: { value: string } | null } | null;
  }>(
    `query GetWishlist($id: ID!) {
      customer(id: $id) {
        metafield(namespace: "app", key: "wishlist") {
          value
        }
      }
    }`,
    { id: customerGid }
  );
  const raw = data?.customer?.metafield?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WishlistItem[];
  } catch {
    return [];
  }
}

/**
 * Add a product to the customer's wishlist metafield.
 * No-op if the product is already in the wishlist.
 */
export async function addToWishlist(
  customerGid: string,
  item: Omit<WishlistItem, "addedAt">
): Promise<WishlistItem[]> {
  const current = await getWishlist(customerGid);
  // Deduplicate by productId
  if (current.some((w) => w.productId === item.productId)) return current;
  const updated: WishlistItem[] = [
    ...current,
    { ...item, addedAt: new Date().toISOString() },
  ];
  await adminFetch<{ metafieldsSet: { userErrors: { message: string }[] } }>(
    `mutation SetWishlist($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key value }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId: customerGid,
          namespace: "app",
          key: "wishlist",
          value: JSON.stringify(updated),
          type: "json",
        },
      ],
    }
  );
  return updated;
}

/**
 * Remove a product from the customer's wishlist metafield.
 */
export async function removeFromWishlist(
  customerGid: string,
  productId: string
): Promise<WishlistItem[]> {
  const current = await getWishlist(customerGid);
  const updated = current.filter((w) => w.productId !== productId);
  // Only write back if something actually changed
  if (updated.length === current.length) return current;
  await adminFetch<{ metafieldsSet: { userErrors: { message: string }[] } }>(
    `mutation SetWishlist($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key value }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId: customerGid,
          namespace: "app",
          key: "wishlist",
          value: JSON.stringify(updated),
          type: "json",
        },
      ],
    }
  );
  return updated;
}
