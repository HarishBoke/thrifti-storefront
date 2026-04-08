import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Wishlist table — stores saved/hearted products per Shopify customer
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  /** Shopify customer email — used as the stable identifier for Shopify customers */
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  /** Shopify product handle — used to fetch product details from Storefront API */
  productHandle: varchar("productHandle", { length: 255 }).notNull(),
  /** Shopify product ID (GID format: gid://shopify/Product/123) */
  productId: varchar("productId", { length: 255 }).notNull(),
  /** Product title cached at save time for display without re-fetching */
  productTitle: text("productTitle"),
  /** Product image URL cached at save time */
  productImage: text("productImage"),
  /** Product price cached at save time */
  productPrice: varchar("productPrice", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;