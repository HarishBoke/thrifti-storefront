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
