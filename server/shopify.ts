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

// ---------------------------------------------------------------------------
// Types: Customer
// ---------------------------------------------------------------------------

export interface ShopifyCustomer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  defaultAddress: {
    id: string;
    address1: string | null;
    address2: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
    zip: string | null;
  } | null;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: {
    nodes: {
      title: string;
      quantity: number;
      variant: {
        price: { amount: string; currencyCode: string };
        image: ShopifyImage | null;
      } | null;
    }[];
  };
}

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface CustomerUserError {
  field: string[] | null;
  message: string;
  code: string | null;
}

// ---------------------------------------------------------------------------
// Mutation: Customer login (create access token)
// ---------------------------------------------------------------------------

export async function customerLogin(
  email: string,
  password: string
): Promise<{ accessToken: CustomerAccessToken | null; errors: CustomerUserError[] }> {
  const gql = `
    mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: CustomerAccessToken | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(gql, { input: { email, password } });

  return {
    accessToken: data.customerAccessTokenCreate.customerAccessToken,
    errors: data.customerAccessTokenCreate.customerUserErrors,
  };
}

// ---------------------------------------------------------------------------
// Mutation: Customer register
// ---------------------------------------------------------------------------

export async function customerRegister(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ customer: ShopifyCustomer | null; errors: CustomerUserError[] }> {
  const gql = `
    mutation CustomerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id firstName lastName email phone createdAt
          defaultAddress {
            id address1 address2 city province country zip
          }
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customerCreate: {
      customer: ShopifyCustomer | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(gql, { input: { firstName, lastName, email, password } });

  return {
    customer: data.customerCreate.customer,
    errors: data.customerCreate.customerUserErrors,
  };
}

// ---------------------------------------------------------------------------
// Mutation: Customer logout (delete access token)
// ---------------------------------------------------------------------------

export async function customerLogout(accessToken: string): Promise<boolean> {
  const gql = `
    mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        userErrors { field message }
      }
    }
  `;

  await shopifyFetch(gql, { customerAccessToken: accessToken });
  return true;
}

// ---------------------------------------------------------------------------
// Query: Get customer by access token
// ---------------------------------------------------------------------------

export async function getCustomer(accessToken: string): Promise<ShopifyCustomer | null> {
  const gql = `
    query GetCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id firstName lastName email phone createdAt
        defaultAddress {
          id address1 address2 city province country zip
        }
      }
    }
  `;

  const data = await shopifyFetch<{ customer: ShopifyCustomer | null }>(gql, {
    customerAccessToken: accessToken,
  });
  return data.customer;
}

// ---------------------------------------------------------------------------
// Query: Get customer orders
// ---------------------------------------------------------------------------

export async function getCustomerOrders(
  accessToken: string,
  first = 10
): Promise<ShopifyOrder[]> {
  const gql = `
    query GetCustomerOrders($customerAccessToken: String!, $first: Int!) {
      customer(customerAccessToken: $customerAccessToken) {
        orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
          nodes {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice { amount currencyCode }
            lineItems(first: 10) {
              nodes {
                title
                quantity
                variant {
                  price { amount currencyCode }
                  image { url altText width height }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customer: { orders: { nodes: ShopifyOrder[] } } | null;
  }>(gql, { customerAccessToken: accessToken, first });

  return data.customer?.orders.nodes ?? [];
}

// ---------------------------------------------------------------------------
// Mutation: Customer recover (forgot password — sends reset email)
// ---------------------------------------------------------------------------

export async function customerRecover(email: string): Promise<{ success: boolean; errors: CustomerUserError[] }> {
  const gql = `
    mutation CustomerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customerRecover: { customerUserErrors: CustomerUserError[] };
  }>(gql, { email });

  const errors = data.customerRecover.customerUserErrors;
  return { success: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Types: Customer Address
// ---------------------------------------------------------------------------

export interface ShopifyAddress {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zip: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface AddressInput {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ---------------------------------------------------------------------------
// Query: Get all customer addresses
// ---------------------------------------------------------------------------

export async function getCustomerAddresses(accessToken: string): Promise<ShopifyAddress[]> {
  const gql = `
    query GetCustomerAddresses($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        addresses(first: 10) {
          nodes {
            id address1 address2 city province country zip firstName lastName phone
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customer: { addresses: { nodes: ShopifyAddress[] } } | null;
  }>(gql, { customerAccessToken: accessToken });

  return data.customer?.addresses.nodes ?? [];
}

// ---------------------------------------------------------------------------
// Mutation: Create customer address
// ---------------------------------------------------------------------------

export async function createCustomerAddress(
  accessToken: string,
  address: AddressInput
): Promise<{ address: ShopifyAddress | null; errors: CustomerUserError[] }> {
  const gql = `
    mutation CustomerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
        customerAddress {
          id address1 address2 city province country zip firstName lastName phone
        }
        customerUserErrors {
          field message code
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customerAddressCreate: {
      customerAddress: ShopifyAddress | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(gql, { customerAccessToken: accessToken, address });

  return {
    address: data.customerAddressCreate.customerAddress,
    errors: data.customerAddressCreate.customerUserErrors,
  };
}

// ---------------------------------------------------------------------------
// Mutation: Update customer address
// ---------------------------------------------------------------------------

export async function updateCustomerAddress(
  accessToken: string,
  addressId: string,
  address: AddressInput
): Promise<{ address: ShopifyAddress | null; errors: CustomerUserError[] }> {
  const gql = `
    mutation CustomerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
      customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
        customerAddress {
          id address1 address2 city province country zip firstName lastName phone
        }
        customerUserErrors {
          field message code
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customerAddressUpdate: {
      customerAddress: ShopifyAddress | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(gql, { customerAccessToken: accessToken, id: addressId, address });

  return {
    address: data.customerAddressUpdate.customerAddress,
    errors: data.customerAddressUpdate.customerUserErrors,
  };
}

// ---------------------------------------------------------------------------
// Mutation: Delete customer address
// ---------------------------------------------------------------------------

export async function deleteCustomerAddress(
  accessToken: string,
  addressId: string
): Promise<{ success: boolean; errors: CustomerUserError[] }> {
  const gql = `
    mutation CustomerAddressDelete($customerAccessToken: String!, $id: ID!) {
      customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
        deletedCustomerAddressId
        customerUserErrors {
          field message code
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customerAddressDelete: {
      deletedCustomerAddressId: string | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(gql, { customerAccessToken: accessToken, id: addressId });

  const errors = data.customerAddressDelete.customerUserErrors;
  return { success: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Mutation: Set default customer address
// ---------------------------------------------------------------------------

export async function setDefaultCustomerAddress(
  accessToken: string,
  addressId: string
): Promise<{ success: boolean; errors: CustomerUserError[] }> {
  const gql = `
    mutation CustomerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
      customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
        customer {
          id
        }
        customerUserErrors {
          field message code
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customerDefaultAddressUpdate: {
      customer: { id: string } | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(gql, { customerAccessToken: accessToken, addressId });

  const errors = data.customerDefaultAddressUpdate.customerUserErrors;
  return { success: errors.length === 0, errors };
}
