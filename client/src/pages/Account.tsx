import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import StorefrontLayout from "@/components/StorefrontLayout";
import { toast } from "sonner";
import {
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Heart,
} from "lucide-react";

type AddressForm = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
};

const emptyAddress: AddressForm = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  country: "India",
  zip: "",
  phone: "",
};

const inputClass =
  "w-full border-2 border-black px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#CC2200] transition-colors";
const labelClass = "block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1";

type ActiveTab = "orders" | "addresses" | "wishlist";

export default function Account() {
  const { customer, accessToken, isLoading, isAuthenticated, logout } = useShopifyAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);

  const utils = trpc.useUtils();

  const { data: orders, isLoading: ordersLoading } = trpc.customer.orders.useQuery(
    { accessToken: accessToken ?? "", first: 10 },
    { enabled: !!accessToken && isAuthenticated }
  );

  const { data: addresses, isLoading: addressesLoading } = trpc.customerAddress.list.useQuery(
    { accessToken: accessToken ?? "" },
    { enabled: !!accessToken && isAuthenticated }
  );

  const { data: wishlistItems, isLoading: wishlistLoading } = trpc.wishlist.list.useQuery(
    { customerGid: customer?.id ?? "" },
    { enabled: !!customer?.email && isAuthenticated }
  );

  const createAddressMutation = trpc.customerAddress.create.useMutation({
    onSuccess: () => {
      toast.success("Address added successfully.");
      setShowAddressModal(false);
      setAddressForm(emptyAddress);
      utils.customerAddress.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to add address."),
  });

  const updateAddressMutation = trpc.customerAddress.update.useMutation({
    onSuccess: () => {
      toast.success("Address updated.");
      setShowAddressModal(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddress);
      utils.customerAddress.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to update address."),
  });

  const deleteAddressMutation = trpc.customerAddress.delete.useMutation({
    onSuccess: () => {
      toast.success("Address removed.");
      utils.customerAddress.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to remove address."),
  });

  const setDefaultMutation = trpc.customerAddress.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Default address updated.");
      utils.customerAddress.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to set default address."),
  });

  const removeWishlistMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate({ customerGid: customer?.id ?? "" });
    },
    onError: (err) => toast.error(err.message || "Failed to remove item."),
  });

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

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setShowAddressModal(true);
  };

  const openEditAddress = (addr: NonNullable<typeof addresses>[number]) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      firstName: addr.firstName ?? "",
      lastName: addr.lastName ?? "",
      address1: addr.address1 ?? "",
      address2: addr.address2 ?? "",
      city: addr.city ?? "",
      province: addr.province ?? "",
      country: addr.country ?? "India",
      zip: addr.zip ?? "",
      phone: addr.phone ?? "",
    });
    setShowAddressModal(true);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    const payload = {
      accessToken,
      address: {
        firstName: addressForm.firstName || undefined,
        lastName: addressForm.lastName || undefined,
        address1: addressForm.address1,
        address2: addressForm.address2 || undefined,
        city: addressForm.city,
        province: addressForm.province || undefined,
        country: addressForm.country,
        zip: addressForm.zip,
        phone: addressForm.phone || undefined,
      },
    };
    if (editingAddressId) {
      updateAddressMutation.mutate({ ...payload, addressId: editingAddressId });
    } else {
      createAddressMutation.mutate(payload);
    }
  };

  const updateField = (field: keyof AddressForm, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
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
    [customer?.firstName?.[0], customer?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "C";

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "orders", label: "Orders", icon: <Package size={14} /> },
    { key: "addresses", label: "Addresses", icon: <MapPin size={14} /> },
    { key: "wishlist", label: "Wishlist", icon: <Heart size={14} /> },
  ];

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-[#F5F0E8]">
        {/* Hero header */}
        <div className="bg-black text-white py-16 px-4 text-center">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">My Account</p>
          <h1 className="text-3xl md:text-4xl font-black uppercase font-['Space_Grotesk']">
            {fullName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{customer?.email}</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
          {/* Profile card */}
          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#CC2200] text-white flex items-center justify-center text-xl font-black shrink-0">
                {initials}
              </div>
              <div>
                <p className="font-bold text-lg">{fullName}</p>
                <p className="text-sm text-gray-500">{customer?.email}</p>
                {customer?.phone && <p className="text-sm text-gray-500">{customer.phone}</p>}
              </div>
            </div>
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

          {/* Tabs */}
          <div className="flex border-2 border-black">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === t.key
                    ? "bg-black text-white"
                    : "bg-transparent text-black hover:bg-gray-100"
                }`}
              >
                {t.icon}
                {t.label}
                {t.key === "wishlist" && wishlistItems && wishlistItems.length > 0 && (
                  <span className="ml-1 bg-[#CC2200] text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {activeTab === "orders" && (
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
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">No orders yet</p>
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
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="bg-white border-2 border-black">
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#CC2200]" />
                  <h2 className="font-bold text-sm uppercase tracking-widest">Saved Addresses</h2>
                </div>
                <button
                  onClick={openAddAddress}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-[#CC2200] text-white px-3 py-2 hover:bg-[#aa1a00] transition-colors"
                >
                  <Plus size={12} /> Add New
                </button>
              </div>

              {addressesLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#CC2200] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {addr.id === customer?.defaultAddress?.id && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-[#CC2200] text-white px-2 py-0.5 mb-2">
                              <Star size={9} /> Default
                            </span>
                          )}
                          <p className="font-bold text-sm">
                            {[addr.firstName, addr.lastName].filter(Boolean).join(" ")}
                          </p>
                          <p className="text-sm text-gray-600">{addr.address1}</p>
                          {addr.address2 && <p className="text-sm text-gray-600">{addr.address2}</p>}
                          <p className="text-sm text-gray-600">
                            {[addr.city, addr.province, addr.zip].filter(Boolean).join(", ")}
                          </p>
                          <p className="text-sm text-gray-600">{addr.country}</p>
                          {addr.phone && <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => openEditAddress(addr)}
                            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-[#CC2200] transition-colors"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          {addr.id !== customer?.defaultAddress?.id && (
                            <button
                              onClick={() => accessToken && setDefaultMutation.mutate({ accessToken, addressId: addr.id })}
                              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-[#CC2200] transition-colors"
                            >
                              <Star size={11} /> Set Default
                            </button>
                          )}
                          <button
                            onClick={() => accessToken && deleteAddressMutation.mutate({ accessToken, addressId: addr.id })}
                            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <MapPin size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">No addresses saved</p>
                  <p className="text-xs text-gray-400 mt-1">Add an address to speed up checkout.</p>
                  <button
                    onClick={openAddAddress}
                    className="inline-block mt-4 bg-[#CC2200] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#aa1a00] transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="bg-white border-2 border-black">
              <div className="flex items-center gap-2 px-6 py-4 border-b-2 border-black">
                <Heart size={16} className="text-[#CC2200]" />
                <h2 className="font-bold text-sm uppercase tracking-widest">Saved Items</h2>
              </div>

              {wishlistLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#CC2200] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : wishlistItems && wishlistItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-x divide-y divide-gray-100">
                  {wishlistItems.map((item) => (
                    <div key={item.productId} className="relative group p-3">
                      <a href={`/products/${item.productHandle}`} className="block">
                        <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productTitle ?? ""}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#CC2200] truncate">
                          {item.productTitle}
                        </p>
                        {item.productPrice && (
                          <p className="text-sm font-bold text-black mt-0.5">{item.productPrice}</p>
                        )}
                      </a>
                      <button
                        onClick={() =>
                          customer?.email &&
                          removeWishlistMutation.mutate({
                            customerGid: customer?.id ?? "",
                            productId: item.productId,
                          })
                        }
                        className="absolute top-2 right-2 w-6 h-6 bg-white border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from wishlist"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <Heart size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">No saved items</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Heart products while browsing to save them here.
                  </p>
                  <a
                    href="/products"
                    className="inline-block mt-4 bg-[#CC2200] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#aa1a00] transition-colors"
                  >
                    Browse Products
                  </a>
                </div>
              )}
            </div>
          )}

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

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white border-2 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
              <h3 className="font-black text-sm uppercase tracking-widest">
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => { setShowAddressModal(false); setAddressForm(emptyAddress); }}
                className="hover:text-[#CC2200] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    value={addressForm.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    placeholder="Priya"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    value={addressForm.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    placeholder="Sharma"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Address Line 1 *</label>
                <input
                  type="text"
                  value={addressForm.address1}
                  onChange={(e) => updateField("address1", e.target.value)}
                  placeholder="123, MG Road"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Address Line 2</label>
                <input
                  type="text"
                  value={addressForm.address2}
                  onChange={(e) => updateField("address2", e.target.value)}
                  placeholder="Apt, Suite, Floor (optional)"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Bengaluru"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>State / Province</label>
                  <input
                    type="text"
                    value={addressForm.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    placeholder="Karnataka"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>PIN Code *</label>
                  <input
                    type="text"
                    value={addressForm.zip}
                    onChange={(e) => updateField("zip", e.target.value)}
                    placeholder="560001"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Country *</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="India"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddressModal(false); setAddressForm(emptyAddress); }}
                  className="flex-1 border-2 border-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                  className="flex-1 bg-[#CC2200] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#aa1a00] transition-colors disabled:opacity-60"
                >
                  {createAddressMutation.isPending || updateAddressMutation.isPending
                    ? "Saving..."
                    : editingAddressId
                    ? "Update Address"
                    : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
}
