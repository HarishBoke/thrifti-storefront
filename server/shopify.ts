/**
 * Shopify Storefront API client and query helpers.
 * All Shopify API calls are made server-side to protect credentials.
 */

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const SHOPIFY_API_VERSION = "2024-01";

export const SHOPIFY_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  variants: { nodes: ShopifyProductVariant[] };
  options: { name: string; values: string[] }[];
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: { nodes: ShopifyProduct[]; pageInfo: PageInfo };
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: {
    nodes: CartLine[];
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    product: { title: string; handle: string; featuredImage: ShopifyImage | null };
  };
  cost: {
    totalAmount: { amount: string; currencyCode: string };
  };
}

// ---------------------------------------------------------------------------
// Core fetcher
// ---------------------------------------------------------------------------

export async function shopifyFetch<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    throw new Error("Shopify credentials not configured");
  }

  const response = await fetch(SHOPIFY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as { data?: T; errors?: { message: string }[] };

  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`);
  }

  return json.data as T;
}

// ---------------------------------------------------------------------------
// Fragment helpers
// ---------------------------------------------------------------------------

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    createdAt
    updatedAt
    featuredImage { url altText width height }
    images(first: 10) { nodes { url altText width height } }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 20) {
      nodes {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url altText width height }
      }
    }
    options { name values }
  }
`;

// ---------------------------------------------------------------------------
// Query: Get all products
// ---------------------------------------------------------------------------

export async function getProducts(
  first = 24,
  after?: string,
  query?: string,
  sortKey = "CREATED_AT",
  reverse = true
): Promise<{ products: ShopifyProduct[]; pageInfo: PageInfo }> {
  const gql = `
    ${PRODUCT_FRAGMENT}
    query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
        nodes { ...ProductFields }
      }
    }
  `;

  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[]; pageInfo: PageInfo } }>(
    gql,
    { first, after, query: query || null, sortKey, reverse }
  );

  return { products: data.products.nodes, pageInfo: data.products.pageInfo };
}

// ---------------------------------------------------------------------------
// Query: Get product by handle
// ---------------------------------------------------------------------------

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const gql = `
    ${PRODUCT_FRAGMENT}
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) { ...ProductFields }
    }
  `;

  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(gql, { handle });
  return data.product;
}

// ---------------------------------------------------------------------------
// Query: Get all collections
// ---------------------------------------------------------------------------

export async function getCollections(): Promise<ShopifyCollection[]> {
  const gql = `
    query GetCollections {
      collections(first: 20) {
        nodes {
          id handle title description
          image { url altText width height }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>(gql);
  return data.collections.nodes;
}

// ---------------------------------------------------------------------------
// Query: Get collection by handle with products
// ---------------------------------------------------------------------------

export async function getCollectionByHandle(
  handle: string,
  first = 24
): Promise<ShopifyCollection | null> {
  const gql = `
    ${PRODUCT_FRAGMENT}
    query GetCollection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id handle title description
        image { url altText width height }
        products(first: $first) {
          pageInfo { hasNextPage endCursor }
          nodes { ...ProductFields }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ collection: ShopifyCollection | null }>(gql, { handle, first });
  return data.collection;
}

// ---------------------------------------------------------------------------
// Mutation: Create cart
// ---------------------------------------------------------------------------

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const gql = `
    mutation CreateCart($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id checkoutUrl totalQuantity
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
          lines(first: 50) {
            nodes {
              id quantity
              merchandise {
                ... on ProductVariant {
                  id title
                  price { amount currencyCode }
                  product { title handle featuredImage { url altText width height } }
                }
              }
              cost { totalAmount { amount currencyCode } }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(gql, { lines });
  return data.cartCreate.cart;
}

// ---------------------------------------------------------------------------
// Query: Get cart by ID
// ---------------------------------------------------------------------------

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const gql = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        id checkoutUrl totalQuantity
        cost {
          totalAmount { amount currencyCode }
          subtotalAmount { amount currencyCode }
        }
        lines(first: 50) {
          nodes {
            id quantity
            merchandise {
              ... on ProductVariant {
                id title
                price { amount currencyCode }
                product { title handle featuredImage { url altText width height } }
              }
            }
            cost { totalAmount { amount currencyCode } }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(gql, { cartId });
  return data.cart;
}

// ---------------------------------------------------------------------------
// Mutation: Add lines to cart
// ---------------------------------------------------------------------------

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const gql = `
    mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id checkoutUrl totalQuantity
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
          lines(first: 50) {
            nodes {
              id quantity
              merchandise {
                ... on ProductVariant {
                  id title
                  price { amount currencyCode }
                  product { title handle featuredImage { url altText width height } }
                }
              }
              cost { totalAmount { amount currencyCode } }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(gql, { cartId, lines });
  return data.cartLinesAdd.cart;
}

// ---------------------------------------------------------------------------
// Mutation: Update cart line quantities
// ---------------------------------------------------------------------------

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<ShopifyCart> {
  const gql = `
    mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id checkoutUrl totalQuantity
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
          lines(first: 50) {
            nodes {
              id quantity
              merchandise {
                ... on ProductVariant {
                  id title
                  price { amount currencyCode }
                  product { title handle featuredImage { url altText width height } }
                }
              }
              cost { totalAmount { amount currencyCode } }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>(gql, { cartId, lines });
  return data.cartLinesUpdate.cart;
}

// ---------------------------------------------------------------------------
// Mutation: Remove cart lines
// ---------------------------------------------------------------------------

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const gql = `
    mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id checkoutUrl totalQuantity
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
          lines(first: 50) {
            nodes {
              id quantity
              merchandise {
                ... on ProductVariant {
                  id title
                  price { amount currencyCode }
                  product { title handle featuredImage { url altText width height } }
                }
              }
              cost { totalAmount { amount currencyCode } }
            }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(gql, { cartId, lineIds });
  return data.cartLinesRemove.cart;
}

// ---------------------------------------------------------------------------
// Helper: Format price
// ---------------------------------------------------------------------------

export function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}
