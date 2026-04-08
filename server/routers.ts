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
  getCustomer,
  getCustomerOrders,
} from "./shopify";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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
        // Auto-login after registration
        const loginResult = await customerLogin(input.email, input.password);
        if (!loginResult.accessToken) {
          throw new Error("Account created but login failed. Please log in manually.");
        }
        return { accessToken: loginResult.accessToken.accessToken, expiresAt: loginResult.accessToken.expiresAt };
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
