import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface ShopifyCustomer {
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

interface ShopifyAuthContextValue {
  customer: ShopifyCustomer | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setTokenAndFetch: (token: string, expiresAt: string) => void;
  logout: () => Promise<void>;
}

const ShopifyAuthContext = createContext<ShopifyAuthContextValue | null>(null);

const TOKEN_KEY = "shopify_customer_token";
const EXPIRES_KEY = "shopify_customer_token_expires";

export function ShopifyAuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expires = localStorage.getItem(EXPIRES_KEY);
    if (token && expires && new Date(expires) > new Date()) {
      return token;
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    return null;
  });

  const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!accessToken);

  const utils = trpc.useUtils();

  const fetchCustomer = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      const data = await utils.customer.me.fetch({ accessToken: token });
      setCustomer(data ?? null);
    } catch {
      // Token may be expired or invalid
      setCustomer(null);
      setAccessToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EXPIRES_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [utils]);

  useEffect(() => {
    if (accessToken) {
      fetchCustomer(accessToken);
    } else {
      setIsLoading(false);
    }
  }, [accessToken, fetchCustomer]);

  const setTokenAndFetch = useCallback((token: string, expiresAt: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, expiresAt);
    setAccessToken(token);
  }, []);

  const logoutMutation = trpc.customer.logout.useMutation();

  const logout = useCallback(async () => {
    if (accessToken) {
      try {
        await logoutMutation.mutateAsync({ accessToken });
      } catch {
        // Ignore errors during logout
      }
    }
    setCustomer(null);
    setAccessToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }, [accessToken, logoutMutation]);

  return (
    <ShopifyAuthContext.Provider
      value={{
        customer,
        accessToken,
        isLoading,
        isAuthenticated: !!customer,
        setTokenAndFetch,
        logout,
      }}
    >
      {children}
    </ShopifyAuthContext.Provider>
  );
}

export function useShopifyAuth() {
  const ctx = useContext(ShopifyAuthContext);
  if (!ctx) throw new Error("useShopifyAuth must be used within ShopifyAuthProvider");
  return ctx;
}
