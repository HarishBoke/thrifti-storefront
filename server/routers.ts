import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getProducts,
  getProductByHandle,
  getCollections,
  getCollectionByHandle,
  createCart,
  getCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  customerLogin,
  customerRegister,
  customerLogout,
  customerRecover,
  getCustomer,
  getCustomerOrders,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from "./shopify";
import { invokeLLM } from "./_core/llm";
import { incrementProductViewCount, getProductViewCount, setCustomerSellerRole, getCustomerByPhone, setCustomerTempPassword } from "./shopifyAdmin";
import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users, wishlists } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ---------------------------------------------------------------------------
  // Shopify: Products
  // ---------------------------------------------------------------------------
  products: router({
    list: publicProcedure
      .input(
        z.object({
          first: z.number().min(1).max(100).default(24),
          after: z.string().optional(),
          query: z.string().optional(),
          sortKey: z.string().optional(),
          reverse: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        return getProducts(
          input.first,
          input.after,
          input.query,
          input.sortKey,
          input.reverse ?? true
        );
      }),

    byHandle: publicProcedure
      .input(z.object({ handle: z.string() }))
      .query(async ({ input }) => {
        return getProductByHandle(input.handle);
      }),

    // Track a product view — increments the thrifti.view_count metafield in Shopify
    trackView: publicProcedure
      .input(z.object({ productGid: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const count = await incrementProductViewCount(input.productGid);
          return { success: true, count };
        } catch (err) {
          console.error("[ViewCount] Failed to increment:", err);
          return { success: false, count: 0 };
        }
      }),

    // Get current view count for a product
    getViewCount: publicProcedure
      .input(z.object({ productGid: z.string() }))
      .query(async ({ input }) => {
        try {
          const count = await getProductViewCount(input.productGid);
          return { count };
        } catch {
          return { count: 0 };
        }
      }),
  }),

  // ---------------------------------------------------------------------------
  // Shopify: Collections
  // ---------------------------------------------------------------------------
  collections: router({
    list: publicProcedure.query(async () => {
      return getCollections();
    }),

    byHandle: publicProcedure
      .input(z.object({ handle: z.string(), first: z.number().default(24) }))
      .query(async ({ input }) => {
        return getCollectionByHandle(input.handle, input.first);
      }),
  }),

  // ---------------------------------------------------------------------------
  // Shopify: Cart
  // ---------------------------------------------------------------------------
  cart: router({
    create: publicProcedure
      .input(
        z.object({
          lines: z.array(
            z.object({ merchandiseId: z.string(), quantity: z.number().min(1) })
          ),
        })
      )
      .mutation(async ({ input }) => {
        return createCart(input.lines);
      }),

    get: publicProcedure
      .input(z.object({ cartId: z.string() }))
      .query(async ({ input }) => {
        return getCart(input.cartId);
      }),

    addLines: publicProcedure
      .input(
        z.object({
          cartId: z.string(),
          lines: z.array(
            z.object({ merchandiseId: z.string(), quantity: z.number().min(1) })
          ),
        })
      )
      .mutation(async ({ input }) => {
        return addCartLines(input.cartId, input.lines);
      }),

    updateLines: publicProcedure
      .input(
        z.object({
          cartId: z.string(),
          lines: z.array(z.object({ id: z.string(), quantity: z.number().min(0) })),
        })
      )
      .mutation(async ({ input }) => {
        return updateCartLines(input.cartId, input.lines);
      }),

    removeLines: publicProcedure
      .input(z.object({ cartId: z.string(), lineIds: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        return removeCartLines(input.cartId, input.lineIds);
      }),
  }),

  // ---------------------------------------------------------------------------
  // LLM: Product description generator
  // ---------------------------------------------------------------------------
  ai: router({
    generateDescription: publicProcedure
      .input(
        z.object({
          productName: z.string(),
          productType: z.string().optional(),
          condition: z.string().optional(),
          brand: z.string().optional(),
          size: z.string().optional(),
          color: z.string().optional(),
          additionalDetails: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        type MsgContent = string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
        const messages: { role: "system" | "user"; content: MsgContent }[] = [
          {
            role: "system",
            content: `You are a professional fashion copywriter for Thrifti, a circular fashion marketplace. Write compelling, concise product descriptions for second-hand fashion items. Focus on style, condition, and unique appeal. Keep descriptions between 80-120 words. Use an engaging, modern tone that resonates with fashion-conscious buyers. Format: Start with a punchy opening line, then describe the item, condition, and styling suggestions.`,
          },
        ];

        const userContent: { type: string; text?: string; image_url?: { url: string } }[] = [];
        if (input.imageUrl) {
          userContent.push({ type: "image_url", image_url: { url: input.imageUrl } });
        }
        const details = [
          `Product: ${input.productName}`,
          input.brand ? `Brand: ${input.brand}` : null,
          input.productType ? `Type: ${input.productType}` : null,
          input.condition ? `Condition: ${input.condition}` : null,
          input.size ? `Size: ${input.size}` : null,
          input.color ? `Color: ${input.color}` : null,
          input.additionalDetails ? `Additional details: ${input.additionalDetails}` : null,
        ].filter(Boolean).join("\n");
        userContent.push({ type: "text", text: `Write a compelling product description for this item:\n\n${details}` });
        messages.push({ role: "user", content: userContent });

        const response = await invokeLLM({ messages: messages as Parameters<typeof invokeLLM>[0]["messages"] });
        const content = response.choices?.[0]?.message?.content;
        return { description: typeof content === "string" ? content : "" };
      }),
  }),

  // ---------------------------------------------------------------------------
  // Orders: Notify owner on new order
  // ---------------------------------------------------------------------------
  orders: router({
    notifyNewOrder: publicProcedure
      .input(
        z.object({
          orderNumber: z.string(),
          customerName: z.string(),
          customerEmail: z.string(),
          totalPrice: z.string(),
          items: z.array(
            z.object({ title: z.string(), quantity: z.number(), price: z.string() })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const itemsList = input.items
          .map((item) => `• ${item.title} x${item.quantity} — ${item.price}`)
          .join("\n");
        await notifyOwner({
          title: `🛍️ New Order #${input.orderNumber} on Thrifti`,
          content: `A new order has been placed!\n\nCustomer: ${input.customerName} (${input.customerEmail})\nOrder Total: ${input.totalPrice}\n\nItems:\n${itemsList}`,
        });
        return { success: true };
      }),
  }),

  // ---------------------------------------------------------------------------
  // Shopify Customer Auth
  // ---------------------------------------------------------------------------
  customer: router({
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const result = await customerLogin(input.email, input.password);
        if (result.errors.length > 0) {
          throw new Error(result.errors[0]?.message || "Login failed");
        }
        if (!result.accessToken) {
          throw new Error("Invalid email or password");
        }
        return { accessToken: result.accessToken.accessToken, expiresAt: result.accessToken.expiresAt };
      }),

    register: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(5, "Password must be at least 5 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const result = await customerRegister(
          input.firstName,
          input.lastName,
          input.email,
          input.password
        );
        if (result.errors.length > 0) {
          throw new Error(result.errors[0]?.message || "Registration failed");
        }
        if (!result.customer) {
          throw new Error("Could not create account");
        }
        // Assign seller role via Admin API (server-side only — never exposed to browser).
        // Sets: app.role metafield = 'seller' + adds 'seller' tag.
        // This keeps the headless storefront in sync with the WhatsApp bot system.
        try {
          await setCustomerSellerRole(result.customer.id);
        } catch (roleErr) {
          // Non-fatal: log the error but don't block registration.
          // The customer account is already created; role assignment can be retried.
          console.error("[register] Failed to set seller role metafield:", roleErr);
        }
        // Auto-login after registration
        const loginResult = await customerLogin(input.email, input.password);
        if (!loginResult.accessToken) {
          throw new Error("Account created but login failed. Please log in manually.");
        }
        return { accessToken: loginResult.accessToken.accessToken, expiresAt: loginResult.accessToken.expiresAt };
      }),

    // OTP-based phone login: find customer by phone via Admin API, set temp
    // password, issue Shopify access token, then immediately rotate the password.
    loginWithPhone: publicProcedure
      .input(
        z.object({
          phone: z.string().min(10, "Invalid phone number"),
          otpVerifiedToken: z.string().min(1, "OTP verified token is required"),
        })
      )
      .mutation(async ({ input }) => {
        const shopifyCustomer = await getCustomerByPhone(input.phone);
        // If the phone number is not found, return a signal to the client
        // to show the registration form rather than throwing an error.
        if (!shopifyCustomer) {
          return { notFound: true, accessToken: null, expiresAt: null } as const;
        }
        // Generate a secure one-time password derived from the verified OTP token.
        // It is never stored permanently — rotated immediately after login.
        const crypto = await import("crypto");
        const tempPassword = crypto
          .createHmac("sha256", input.otpVerifiedToken)
          .update(`${shopifyCustomer.id}-${Date.now()}`)
          .digest("hex")
          .slice(0, 32);
        // setCustomerTempPassword handles email-less customers (WhatsApp bot users)
        // by auto-assigning a placeholder email (phone.{digits}@thrifti.store)
        // and returns the email to use for Storefront API login.
        const loginEmail = await setCustomerTempPassword(
          shopifyCustomer.id,
          tempPassword,
          shopifyCustomer.email,
          input.phone
        );

        // Shopify Admin API password changes take a moment to propagate to the
        // Storefront API. Retry up to 4 times with a 600ms delay between attempts.
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        let loginResult = await customerLogin(loginEmail, tempPassword);
        for (let attempt = 1; attempt <= 3 && !loginResult.accessToken; attempt++) {
          console.log(`[loginWithPhone] Login attempt ${attempt + 1} — waiting for password propagation...`);
          await sleep(600);
          loginResult = await customerLogin(loginEmail, tempPassword);
        }

        if (!loginResult.accessToken) {
          const errMsg = loginResult.errors?.[0]?.message ?? "Unknown error";
          console.error(`[loginWithPhone] All login attempts failed. Last error: ${errMsg}`);
          throw new Error(`Login failed after OTP verification: ${errMsg}`);
        }

        // Rotate the password to a new random value immediately (security hygiene).
        const newRandom = crypto.randomBytes(32).toString("hex");
        setCustomerTempPassword(shopifyCustomer.id, newRandom, loginEmail, input.phone).catch((err) =>
          console.error("[loginWithPhone] Failed to rotate temp password:", err)
        );
        return {
          notFound: false as const,
          accessToken: loginResult.accessToken.accessToken,
          expiresAt: loginResult.accessToken.expiresAt,
        };
      }),

    // Register a brand-new customer via OTP flow:
    // Creates the Shopify account with phone + email + name, sets app.role=seller,
    // then immediately logs in and returns a Shopify access token.
    registerWithPhone: publicProcedure
      .input(
        z.object({
          phone: z.string().min(10, "Invalid phone number"),
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          email: z.string().email("Valid email is required"),
          otpVerifiedToken: z.string().min(1, "OTP verified token is required"),
        })
      )
      .mutation(async ({ input }) => {
        const crypto = await import("crypto");
        // Generate a secure random password (max 40 chars per Shopify limit).
        // The user never needs to know it — they always log in via OTP.
        const initialPassword = crypto.randomBytes(16).toString("hex"); // 32 hex chars, well under 40

        // Create the Shopify customer account
        const result = await customerRegister(
          input.firstName,
          input.lastName,
          input.email,
          initialPassword
        );
        if (result.errors.length > 0) {
          throw new Error(result.errors[0]?.message || "Registration failed");
        }
        if (!result.customer) {
          throw new Error("Could not create account");
        }

        // Update the customer with their phone number + set app.role=seller metafield
        const customerId = result.customer.id; // GID format
        const numericId = parseInt(customerId.split("/").pop() ?? "0", 10);

        // Set phone number via Admin REST API
        if (numericId) {
          const domain = (await import("./_core/env")).ENV.shopifyStoreDomain;
          const token = (await import("./_core/env")).ENV.shopifyAdminToken;
          if (domain && token) {
            await fetch(`https://${domain}/admin/api/2024-01/customers/${numericId}.json`, {
              method: "PUT",
              headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
              body: JSON.stringify({ customer: { id: numericId, phone: input.phone } }),
            }).catch((err) => console.error("[registerWithPhone] Failed to set phone:", err));
          }
        }

        // Set app.role = seller metafield + seller tag
        try {
          await setCustomerSellerRole(customerId);
        } catch (roleErr) {
          console.error("[registerWithPhone] Failed to set seller role:", roleErr);
        }

        // Auto-login: set temp password and get Shopify access token
        const tempPassword = crypto
          .createHmac("sha256", input.otpVerifiedToken)
          .update(`${numericId}-${Date.now()}`)
          .digest("hex")
          .slice(0, 32);
        await setCustomerTempPassword(numericId, tempPassword, input.email, input.phone);

        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        let loginResult = await customerLogin(input.email, tempPassword);
        for (let attempt = 1; attempt <= 3 && !loginResult.accessToken; attempt++) {
          await sleep(600);
          loginResult = await customerLogin(input.email, tempPassword);
        }
        if (!loginResult.accessToken) {
          // Account created but auto-login failed — ask user to log in manually
          throw new Error("Account created! Please sign in with your phone number.");
        }

        // Rotate password
        const newRandom = crypto.randomBytes(32).toString("hex");
        setCustomerTempPassword(numericId, newRandom, input.email, input.phone).catch(() => {});

        return {
          accessToken: loginResult.accessToken.accessToken,
          expiresAt: loginResult.accessToken.expiresAt,
        };
      }),

    logout: publicProcedure
      .input(z.object({ accessToken: z.string() }))
      .mutation(async ({ input }) => {
        await customerLogout(input.accessToken);
        return { success: true };
      }),

    me: publicProcedure
      .input(z.object({ accessToken: z.string() }))
      .query(async ({ input }) => {
        return getCustomer(input.accessToken);
      }),

    orders: publicProcedure
      .input(z.object({ accessToken: z.string(), first: z.number().default(10) }))
      .query(async ({ input }) => {
        return getCustomerOrders(input.accessToken, input.first);
      }),
  }),

  // ---------------------------------------------------------------------------
  // Shopify Customer: Forgot Password
  // ---------------------------------------------------------------------------
  customerRecover: router({
    sendReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const result = await customerRecover(input.email);
        // Always return success to prevent email enumeration
        return { success: true };
      }),
  }),

  // ---------------------------------------------------------------------------
  // Shopify Customer: Address Management
  // ---------------------------------------------------------------------------
  customerAddress: router({
    list: publicProcedure
      .input(z.object({ accessToken: z.string() }))
      .query(async ({ input }) => {
        return getCustomerAddresses(input.accessToken);
      }),

    create: publicProcedure
      .input(
        z.object({
          accessToken: z.string(),
          address: z.object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            address1: z.string().min(1),
            address2: z.string().optional(),
            city: z.string().min(1),
            province: z.string().optional(),
            country: z.string().min(1),
            zip: z.string().min(1),
            phone: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createCustomerAddress(input.accessToken, input.address);
        if (result.errors.length > 0) {
          throw new Error(result.errors[0]?.message || "Failed to create address");
        }
        return result.address;
      }),

    update: publicProcedure
      .input(
        z.object({
          accessToken: z.string(),
          addressId: z.string(),
          address: z.object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            address1: z.string().min(1),
            address2: z.string().optional(),
            city: z.string().min(1),
            province: z.string().optional(),
            country: z.string().min(1),
            zip: z.string().min(1),
            phone: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const result = await updateCustomerAddress(input.accessToken, input.addressId, input.address);
        if (result.errors.length > 0) {
          throw new Error(result.errors[0]?.message || "Failed to update address");
        }
        return result.address;
      }),

    delete: publicProcedure
      .input(z.object({ accessToken: z.string(), addressId: z.string() }))
      .mutation(async ({ input }) => {
        const result = await deleteCustomerAddress(input.accessToken, input.addressId);
        if (result.errors.length > 0) {
          throw new Error(result.errors[0]?.message || "Failed to delete address");
        }
        return { success: true };
      }),

    setDefault: publicProcedure
      .input(z.object({ accessToken: z.string(), addressId: z.string() }))
      .mutation(async ({ input }) => {
        const result = await setDefaultCustomerAddress(input.accessToken, input.addressId);
        if (result.errors.length > 0) {
          throw new Error(result.errors[0]?.message || "Failed to set default address");
        }
        return { success: true };
      }),
  }),

  // ---------------------------------------------------------------------------
  // Wishlist: Saved items (stored in DB by customer email)
  // ---------------------------------------------------------------------------
  wishlist: router({
    list: publicProcedure
      .input(z.object({ customerEmail: z.string().email() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(wishlists).where(eq(wishlists.customerEmail, input.customerEmail));
      }),

    add: publicProcedure
      .input(
        z.object({
          customerEmail: z.string().email(),
          productId: z.string(),
          productHandle: z.string(),
          productTitle: z.string().optional(),
          productImage: z.string().optional(),
          productPrice: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        // Prevent duplicates
        const existing = await db
          .select()
          .from(wishlists)
          .where(and(eq(wishlists.customerEmail, input.customerEmail), eq(wishlists.productId, input.productId)))
          .limit(1);
        if (existing.length > 0) return existing[0];
        await db.insert(wishlists).values({
          customerEmail: input.customerEmail,
          productId: input.productId,
          productHandle: input.productHandle,
          productTitle: input.productTitle ?? null,
          productImage: input.productImage ?? null,
          productPrice: input.productPrice ?? null,
        });
        const inserted = await db
          .select()
          .from(wishlists)
          .where(and(eq(wishlists.customerEmail, input.customerEmail), eq(wishlists.productId, input.productId)))
          .limit(1);
        return inserted[0];
      }),

    remove: publicProcedure
      .input(z.object({ customerEmail: z.string().email(), productId: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db
          .delete(wishlists)
          .where(and(eq(wishlists.customerEmail, input.customerEmail), eq(wishlists.productId, input.productId)));
        return { success: true };
      }),
  }),

  // ---------------------------------------------------------------------------
  // User: Account profile (legacy - kept for backward compat)
  // ---------------------------------------------------------------------------
  account: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return ctx.user;
      const result = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return result[0] ?? ctx.user;
    }),
  }),
});

export type AppRouter = typeof appRouter;
