import { Link } from "wouter";
import { User, Package, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Account() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { data: profile } = trpc.account.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="container py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[oklch(0.52_0.22_25)] border-t-transparent rounded-full animate-spin" />
        </div>
      </StorefrontLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center">
          <User className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1
            className="text-2xl font-black mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Sign In to Your Account
          </h1>
          <p className="text-muted-foreground mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            Access your order history and account settings.
          </p>
            <a href={getLoginUrl()}>
            <Button
              className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white font-semibold px-8"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sign In
            </Button>
          </a>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="bg-[oklch(0.97_0.01_80)] py-10 sm:py-14">
        <div className="container">
          <p
            className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            My Account
          </p>
          <h1
            className="text-3xl sm:text-4xl font-black text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome back, {profile?.name ?? user?.name ?? "Thrifter"}!
          </h1>
        </div>
      </div>

      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Profile Card */}
          <div className="bg-white border border-border rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[oklch(0.52_0.22_25)]/10 flex items-center justify-center">
                <User className="w-6 h-6 text-[oklch(0.52_0.22_25)]" />
              </div>
              <div>
                <p className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {profile?.name ?? user?.name ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {profile?.email ?? user?.email ?? "—"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
              Member since {new Date(profile?.createdAt ?? Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Orders Card */}
          <div className="bg-white border border-border rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[oklch(0.52_0.22_25)]/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-[oklch(0.52_0.22_25)]" />
              </div>
              <div>
                <p className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Order History</p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>Track your purchases</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Your order history is managed through Shopify. Click below to view your orders.
            </p>
            <Button
              variant="outline"
              className="w-full border-foreground text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              onClick={() => window.open("https://shopify.com/account", "_blank")}
            >
              View Orders on Shopify
            </Button>
          </div>

          {/* Sell Card */}
          <div className="bg-[oklch(0.52_0.22_25)] text-white rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Start Selling</p>
                <p className="text-xs text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Turn clothes into cash</p>
              </div>
            </div>
            <p className="text-sm text-white/80 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              List your pre-loved items in under 60 seconds with our WhatsApp concierge.
            </p>
            <Link href="/sell">
              <Button
                className="w-full bg-white text-[oklch(0.52_0.22_25)] hover:bg-white/90 font-semibold text-sm"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Go to Sell Page
              </Button>
            </Link>
          </div>
        </div>

        {/* Sign Out */}
        <div className="mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </StorefrontLayout>
  );
}
