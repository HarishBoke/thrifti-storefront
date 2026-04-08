import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import StorefrontLayout from "@/components/StorefrontLayout";
import { toast } from "sonner";
import { Package, MapPin, LogOut, ChevronRight, ShoppingBag } from "lucide-react";

export default function Account() {
  const { customer, accessToken, isLoading, isAuthenticated, logout } = useShopifyAuth();
  const [, navigate] = useLocation();

  const { data: orders, isLoading: ordersLoading } = trpc.customer.orders.useQuery(
    { accessToken: accessToken ?? "", first: 10 },
    { enabled: !!accessToken && isAuthenticated }
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    toast.success("You've been signed out.");
    navigate("/");
  };

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#CC2200] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 uppercase tracking-widest">Loading...</p>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (!isAuthenticated) return null;

  const fullName =
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || "Customer";
  const initials =
    [customer?.firstName?.[0], customer?.lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    "C";

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-[#F5F0E8]">
        {/* Hero header */}
        <div className="bg-black text-white py-16 px-4 text-center">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">My Account</p>
          <h1
            className="text-3xl md:text-4xl font-black uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {fullName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{customer?.email}</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
          {/* Profile card */}
          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-[#CC2200] text-white flex items-center justify-center text-xl font-black shrink-0">
                {initials}
              </div>
              <div>
                <p className="font-bold text-lg">{fullName}</p>
                <p className="text-sm text-gray-500">{customer?.email}</p>
                {customer?.phone && (
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                )}
              </div>
            </div>

            {customer?.defaultAddress && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="mt-0.5 text-[#CC2200] shrink-0" />
                  <div>
                    <p className="font-semibold text-black text-xs uppercase tracking-widest mb-1">
                      Default Address
                    </p>
                    <p>{customer.defaultAddress.address1}</p>
                    {customer.defaultAddress.address2 && (
                      <p>{customer.defaultAddress.address2}</p>
                    )}
                    <p>
                      {[
                        customer.defaultAddress.city,
                        customer.defaultAddress.province,
                        customer.defaultAddress.zip,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>{customer.defaultAddress.country}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/products"
              className="bg-[#CC2200] text-white p-4 flex items-center justify-between hover:bg-[#aa1a00] transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">Shop Now</span>
              </div>
              <ChevronRight size={16} />
            </a>
            <a
              href="/sell"
              className="bg-black text-white p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Sell an Item</span>
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Orders */}
          <div className="bg-white border-2 border-black">
            <div className="flex items-center gap-2 px-6 py-4 border-b-2 border-black">
              <Package size={16} className="text-[#CC2200]" />
              <h2 className="font-bold text-sm uppercase tracking-widest">Order History</h2>
            </div>

            {ordersLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-[#CC2200] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.processedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-[#CC2200]">
                          ₹{parseFloat(order.totalPrice.amount).toLocaleString("en-IN")}
                        </p>
                        <span
                          className={`text-xs font-bold uppercase px-2 py-0.5 ${
                            order.financialStatus === "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.financialStatus}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {order.lineItems.nodes.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {item.variant?.image && (
                            <img
                              src={item.variant.image.url}
                              alt={item.title}
                              className="w-10 h-10 object-cover border border-gray-200"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <Package size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                  No orders yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Your order history will appear here once you make a purchase.
                </p>
                <a
                  href="/products"
                  className="inline-block mt-4 bg-[#CC2200] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#aa1a00] transition-colors"
                >
                  Start Shopping
                </a>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border-2 border-black py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </StorefrontLayout>
  );
}
