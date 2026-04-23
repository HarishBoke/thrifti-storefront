import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import StorefrontLayout from "@/components/StorefrontLayout";
import { toast } from "sonner";
import {
  Package,
  MapPin,
  LogOut,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Heart,
  Search,
  ShieldCheck,
  Users,
  User,
  Phone,
  Mail,
  Bell,
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

type ActiveTab =
  | "account-overview"
  | "my-listings"
  | "earnings"
  | "my-orders"
  | "wishlist"
  | "personal-information"
  | "saved-addresses"
  | "account-details"
  | "notifications"
  | "settings"
  | "buyer-protection"
  | "terms-of-use"
  | "privacy-center";
type OrderStatusTab = "ongoing" | "completed" | "pending-review";
type ListingStatusTab = "active" | "sold" | "draft";
type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
};
type NotificationSettings = {
  orderUpdatesWhatsapp: boolean;
  orderUpdatesEmail: boolean;
  messagesWhatsapp: boolean;
  messagesEmail: boolean;
  offersWhatsapp: boolean;
  offersEmail: boolean;
  promotionsWhatsapp: boolean;
  promotionsEmail: boolean;
  directMessagesWhatsapp: boolean;
  directMessagesEmail: boolean;
  soldAlertsWhatsapp: boolean;
  soldAlertsEmail: boolean;
};

export default function Account() {
  const { customer, accessToken, isLoading, isAuthenticated, logout } = useShopifyAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<ActiveTab>("account-overview");
  const [orderStatusTab, setOrderStatusTab] = useState<OrderStatusTab>("completed");
  const [listingStatusTab, setListingStatusTab] = useState<ListingStatusTab>("active");
  const [personalInfoForm, setPersonalInfoForm] = useState<PersonalInfoForm>({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderUpdatesWhatsapp: true,
    orderUpdatesEmail: true,
    messagesWhatsapp: true,
    messagesEmail: true,
    offersWhatsapp: true,
    offersEmail: true,
    promotionsWhatsapp: true,
    promotionsEmail: true,
    directMessagesWhatsapp: true,
    directMessagesEmail: true,
    soldAlertsWhatsapp: false,
    soldAlertsEmail: true,
  });

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

  useEffect(() => {
    if (!customer) return;
    const generatedUsername = [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join("_")
      .toLowerCase()
      .replace(/\s+/g, "_");

    setPersonalInfoForm({
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      username: generatedUsername || "customer_account",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
    });
  }, [customer]);

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

  const fullName =
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || "Customer";
  const initials =
    [customer?.firstName?.[0], customer?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "C";
  const sidebarSections: { subtitle: string; items: { key: ActiveTab; label: string }[] }[] = [
    {
      subtitle: "Selling Dashboard",
      items: [
        { key: "my-listings", label: "My Listings" },
        { key: "earnings", label: "Earnings" },
      ],
    },
    {
      subtitle: "Buying Dashboard",
      items: [
        { key: "my-orders", label: "My Orders" },
        { key: "wishlist", label: "Wishlist" },
      ],
    },
    {
      subtitle: "Profile",
      items: [
        { key: "personal-information", label: "Personal Information" },
        { key: "saved-addresses", label: "Saved Addresses" },
        { key: "account-details", label: "Account Details" },
        { key: "notifications", label: "Notifications" },
        { key: "settings", label: "Settings" },
      ],
    },
    {
      subtitle: "Legal",
      items: [
        { key: "buyer-protection", label: "Buyer Protection" },
        { key: "terms-of-use", label: "Terms of Use" },
        { key: "privacy-center", label: "Privacy Center" },
      ],
    },
  ];

  const orderGroups = useMemo(
    () => ({
      ongoing:
        orders?.filter((order) => {
          const status = (order.financialStatus ?? "").toUpperCase();
          return status !== "PAID" && status !== "REFUNDED";
        }) ?? [],
      completed:
        orders?.filter((order) => {
          const status = (order.financialStatus ?? "").toUpperCase();
          return status === "PAID" || status === "REFUNDED";
        }) ?? [],
      "pending-review":
        orders?.filter((order) => {
          const status = (order.financialStatus ?? "").toUpperCase();
          return status === "PAID";
        }) ?? [],
    }),
    [orders]
  );

  const currentOrders = orderGroups[orderStatusTab];

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

  const myListings = [
    {
      id: "listing-1",
      title: "Classic Denim Dress",
      price: "₹1599",
      status: "active" as const,
      image:
        "https://images.unsplash.com/photo-1618244972963-dbad68f19487?auto=format&fit=crop&w=300&q=80",
      bids: 3,
    },
    {
      id: "listing-2",
      title: "Vintage Black Boots",
      price: "₹2199",
      status: "sold" as const,
      image:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80",
      bids: 0,
    },
    {
      id: "listing-3",
      title: "Ivory Linen Co-ord",
      price: "₹1899",
      status: "draft" as const,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80",
      bids: 0,
    },
  ];
  const visibleListings = myListings.filter((listing) => listing.status === listingStatusTab);

  const renderOrdersPanel = () => (
    <div className="bg-[#F4F3EF] border border-[#E6E2DA] p-4 lg:p-6">
      <h2 className="anek-devanagari-font text-3xl font-semibold text-[#1F1F22]">My Orders</h2>
      <p className="geist-mono-font mt-1 text-sm text-[#6E6A62]">
        Track purchases, manage deliveries, and review sellers.
      </p>

      <div className="mt-5 border border-[#E6E2DA] bg-[#F8F7F4]">
        <div className="flex items-center gap-2 border-b border-[#E6E2DA] px-4">
          {([
            ["ongoing", "Ongoing"],
            ["completed", "Completed"],
            ["pending-review", "Pending Review"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setOrderStatusTab(key)}
              className={`px-4 py-3 text-xs uppercase tracking-wider transition-colors ${orderStatusTab === key
                ? "border-b-2 border-[#F42824] text-[#1F1F22] font-semibold"
                : "text-[#7E7A74] hover:text-[#1F1F22]"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {ordersLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#CC2200] border-t-transparent" />
          </div>
        ) : currentOrders.length > 0 ? (
          <div className="divide-y divide-[#E6E2DA]">
            {currentOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="geist-mono-font text-xs text-[#7E7A74]">
                      Order #{order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-[#35392D]">
                      Placed:{" "}
                      {new Date(order.processedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="anek-devanagari-font mt-1 text-2xl font-semibold text-[#1F1F22]">
                      Rs {Math.round(parseFloat(order.totalPrice.amount))}
                    </p>
                  </div>
                  <span className="self-start rounded-full bg-[#D7F4DE] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#1E7A3E]">
                    {order.fulfillmentStatus ?? order.financialStatus ?? "In Progress"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {order.lineItems.nodes.slice(0, 3).map((item, index) => (
                    <div key={index} className="h-12 w-10 overflow-hidden bg-[#EDEAE4]">
                      {item.variant?.image ? (
                        <img
                          src={item.variant.image.url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="geist-mono-font text-sm text-[#7E7A74]">No orders in this section yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSavedAddressesPanel = () => (
    <div className="bg-[#F4F3EF] border border-[#E6E2DA] p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-[#E6E2DA] pb-3">
        <h2 className="geist-mono-font text-xl font-semibold text-[#1F1F22]">Saved Addresses</h2>
        <button
          onClick={openAddAddress}
          className="border border-[#3C3B3F] bg-[#F8F7F4] px-4 py-2 text-sm font-semibold text-[#1F1F22] hover:bg-[#ECEAE4]"
        >
          + Add New Address
        </button>
      </div>

      {addressesLoading ? (
        <div className="p-8 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#CC2200] border-t-transparent" />
        </div>
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="max-w-[420px] overflow-hidden rounded-[4px] border border-[#D8D4CC] bg-[#F8F7F4]">
              <div className="p-4">
                {addr.id === customer?.defaultAddress?.id && (
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E7A74]">
                    Default Address
                  </p>
                )}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-lg font-semibold text-[#1F1F22]">
                    {[addr.firstName, addr.lastName].filter(Boolean).join(" ")}
                  </p>
                  {addr.id === customer?.defaultAddress?.id ? (
                    <span className="text-[10px] uppercase tracking-wider text-[#7E7A74]">Home</span>
                  ) : (
                    <button
                      onClick={() => accessToken && setDefaultMutation.mutate({ accessToken, addressId: addr.id })}
                      className="text-[10px] uppercase tracking-wider text-[#F42824] hover:underline"
                    >
                      Set Default
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#616161]">{addr.address1}</p>
                {addr.address2 && <p className="text-sm text-[#616161]">{addr.address2}</p>}
                <p className="text-sm text-[#616161]">
                  {[addr.city, addr.province, addr.zip].filter(Boolean).join(" - ")}
                </p>
                <p className="text-sm text-[#616161]">{addr.country}</p>
                {addr.phone && <p className="mt-3 text-sm text-[#616161]">Mobile: {addr.phone}</p>}
              </div>

              <div className="grid grid-cols-2 border-t border-[#D8D4CC]">
                <button
                  onClick={() => openEditAddress(addr)}
                  className="h-10 border-r border-[#D8D4CC] text-xs font-semibold uppercase tracking-wider text-[#F42824] hover:bg-[#F0EEEA]"
                >
                  Edit
                </button>
                <button
                  onClick={() => accessToken && deleteAddressMutation.mutate({ accessToken, addressId: addr.id })}
                  className="h-10 text-xs font-semibold uppercase tracking-wider text-[#1F1F22] hover:bg-[#F0EEEA]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="geist-mono-font text-sm text-[#7E7A74]">No saved addresses yet.</p>
      )}
    </div>
  );

  const renderWishlistPanel = () => (
    <div className="bg-[#F4F3EF] border border-[#E6E2DA] p-4 lg:p-6">
      <h2 className="anek-devanagari-font text-3xl font-semibold text-[#1F1F22]">Wishlist</h2>
      <p className="geist-mono-font mt-1 text-sm text-[#6E6A62]">Your saved products.</p>

      {wishlistLoading ? (
        <div className="p-8 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#CC2200] border-t-transparent" />
        </div>
      ) : wishlistItems && wishlistItems.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <div key={item.productId} className="group relative border border-[#E6E2DA] bg-[#FBFAF8] p-2">
              <a href={`/products/${item.productHandle}`} className="block">
                <div className="aspect-[3/4] overflow-hidden bg-[#EDEAE4]">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productTitle ?? ""}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingBag size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-medium text-[#1F1F22]">{item.productTitle}</p>
                {item.productPrice && <p className="text-sm text-[#35392D]">{item.productPrice}</p>}
              </a>
              <button
                onClick={() =>
                  customer?.email &&
                  removeWishlistMutation.mutate({
                    customerGid: customer?.id ?? "",
                    productId: item.productId,
                  })
                }
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center bg-white/90 text-[#1F1F22] hover:text-red-600"
                title="Remove from wishlist"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#7E7A74]">No saved items yet.</p>
      )}
    </div>
  );

  const renderMyListingsPanel = () => (
    <div className="border border-[#E6E2DA] bg-[#F4F3EF] p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="anek-devanagari-font text-3xl font-semibold text-[#1F1F22]">My Listing</h2>
          <p className="geist-mono-font mt-1 text-sm text-[#6E6A62]">
            Track purchases, manage deliveries, and review sellers.
          </p>
        </div>
        <button className="bg-[#1F1F22] px-8 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black">
          Sell Item
        </button>
      </div>

      <div className="mt-5 border border-[#E6E2DA] bg-[#F8F7F4]">
        <div className="flex items-center justify-between border-b border-[#E6E2DA] px-4">
          <div className="flex items-center gap-6">
            {([
              ["active", "Active"],
              ["sold", "Sold"],
              ["draft", "Draft"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setListingStatusTab(key)}
                className={`px-4 py-3 text-xs uppercase tracking-wider transition-colors ${listingStatusTab === key
                  ? "border-b-2 border-[#F42824] font-semibold text-[#1F1F22]"
                  : "text-[#7E7A74] hover:text-[#1F1F22]"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="p-2 text-[#1F1F22] hover:text-[#F42824]" aria-label="Search listing">
            <Search size={15} />
          </button>
        </div>

        {visibleListings.length > 0 ? (
          <div className="divide-y divide-[#E6E2DA]">
            {visibleListings.map((listing) => (
              <div key={listing.id} className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="h-[92px] w-[70px] object-cover"
                    />
                    <div>
                      <p className="geist-mono-font text-2xl font-semibold leading-tight text-[#1F1F22]">
                        {listing.title}
                      </p>
                      <p className="anek-devanagari-font mt-3 text-3xl font-semibold text-[#1F1F22]">
                        {listing.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <div className="flex items-center gap-3 text-[#1F1F22]">
                      <button className="hover:text-[#F42824]" aria-label="Edit listing">
                        <Pencil size={14} />
                      </button>
                      <button className="hover:text-[#F42824]" aria-label="Delete listing">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <button className="bg-[#F42824] px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#d8221d]">
                      {listingStatusTab === "active" ? `View Bids (${listing.bids})` : "View Details"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="geist-mono-font text-sm text-[#7E7A74]">No listings in this section yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAccountOverviewPanel = () => (
    <div className="border border-[#E6E2DA] bg-[#F4F3EF] p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-[#E2DED5]">
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#1F1F22]">
              {initials}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="anek-devanagari-font text-3xl font-semibold text-[#1F1F22] -mb-2">{fullName}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-2 geist-mono-font text-sm font-medium leading-none text-[#148A4B]">
                <ShieldCheck size={16} strokeWidth={2} />
                Verified Seller
              </span>
            </div>
            <div className="geist-mono-font mt-1 flex items-center gap-2 text-xs text-[#6E6A62]">
              <span className="text-[#F6B500]">★★★★★</span>
              <span>4.9</span>
              <span>|</span>
              <span>128 reviews</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("personal-information")}
          className="border border-[#1F1F22] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#1F1F22] hover:bg-[#1F1F22] hover:text-white"
        >
          Edit Profile
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border border-[#E6E2DA] bg-[#EFEDE8] p-4">
          <div className="mb-4">

            <Package size={20} className="text-[#6E6A62] mb-2" />
          </div>
          <p className="anek-devanagari-font text-4xl font-semibold text-[#1F1F22]">24</p>
          <p className="geist-mono-font mt-1 text-xs text-[#6E6A62]">Active Listings</p>
        </div>
        <div className="border border-[#E6E2DA] bg-[#EFEDE8] p-4">
          <div className="mb-4">

            <ShoppingBag size={20} className="text-[#6E6A62]" />
          </div>
          <p className="anek-devanagari-font text-4xl font-semibold text-[#1F1F22]">156</p>
          <p className="geist-mono-font mt-1 text-xs text-[#6E6A62]">Items Sold</p>
        </div>
        <div className="border border-[#E6E2DA] bg-[#EFEDE8] p-4">
          <div className="mb-4">

            <Users size={20} className="text-[#6E6A62]" />
          </div>
          <p className="anek-devanagari-font text-4xl font-semibold text-[#1F1F22]">1.2k</p>
          <p className="geist-mono-font mt-1 text-xs text-[#6E6A62]">Followers</p>
        </div>
      </div>

      <div className="mt-5 rounded-[4px] bg-[#1E1F24] p-4 text-white">
        <p className="geist-mono-font text-sm font-semibold">Trust Score: Excellent</p>
        <p className="geist-mono-font mt-2 text-xs text-white/70">
          Your fast shipping and high review ratings keep your trust score at the top level.
          Buyers are 3x more likely to purchase from you!
        </p>
        <div className="mt-4 h-1.5 w-full rounded-full bg-white/20">
          <div className="h-full w-[95%] rounded-full bg-[#2BE38A]" />
        </div>
      </div>
    </div >
  );

  const renderPersonalInformationPanel = () => {
    const resetPersonalInfo = () => {
      if (!customer) return;
      const generatedUsername = [customer.firstName, customer.lastName]
        .filter(Boolean)
        .join("_")
        .toLowerCase()
        .replace(/\s+/g, "_");

      setPersonalInfoForm({
        firstName: customer.firstName ?? "",
        lastName: customer.lastName ?? "",
        username: generatedUsername || "customer_account",
        phone: customer.phone ?? "",
        email: customer.email ?? "",
      });
    };

    return (
      <div className="border border-[#E6E2DA] bg-[#F4F3EF] p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-[#1F1F22]">Edit Profile</h2>

        <div className="mt-3 rounded-[4px] border border-[#D8D4CC] bg-[#F8F7F4] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="h-[92px] w-[72px] overflow-hidden rounded-[24px] bg-[#E2DED5]">
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#1F1F22]">
                {initials}
              </div>
            </div>
            <div>
              <p className="geist-mono-font text-2xl font-semibold text-[#1F1F22]">Profile Photo</p>
              <p className="geist-mono-font mt-1 text-xs text-[#7E7A74]">
                We recommend an image of at least 400x400. GIFs work too.
              </p>
              <button className="mt-3 border border-[#1F1F22] bg-[#F5F4F1] px-4 py-2 text-xs font-semibold text-[#1F1F22] hover:bg-[#ECEAE4]">
                Upload New Photo
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1F1F22]">
                <User size={11} />
                First Name
              </label>
              <input
                type="text"
                value={personalInfoForm.firstName}
                onChange={(e) => setPersonalInfoForm((prev) => ({ ...prev, firstName: e.target.value }))}
                className="h-11 w-full border border-[#3C3B3F] bg-[#F7F6F3] px-3 text-sm outline-none focus:border-[#1F1F22]"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1F1F22]">
                <User size={11} />
                Last Name
              </label>
              <input
                type="text"
                value={personalInfoForm.lastName}
                onChange={(e) => setPersonalInfoForm((prev) => ({ ...prev, lastName: e.target.value }))}
                className="h-11 w-full border border-[#3C3B3F] bg-[#F7F6F3] px-3 text-sm outline-none focus:border-[#1F1F22]"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1F1F22]">
                <User size={11} />
                Username
              </label>
              <input
                type="text"
                value={personalInfoForm.username}
                onChange={(e) => setPersonalInfoForm((prev) => ({ ...prev, username: e.target.value }))}
                className="h-11 w-full border border-[#3C3B3F] bg-[#F7F6F3] px-3 text-sm outline-none focus:border-[#1F1F22]"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1F1F22]">
                <Phone size={11} />
                Phone Number
              </label>
              <input
                type="tel"
                value={personalInfoForm.phone}
                onChange={(e) => setPersonalInfoForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="h-11 w-full border border-[#3C3B3F] bg-[#F7F6F3] px-3 text-sm outline-none focus:border-[#1F1F22]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1F1F22]">
                <Mail size={11} />
                Email Address
              </label>
              <input
                type="email"
                value={personalInfoForm.email}
                onChange={(e) => setPersonalInfoForm((prev) => ({ ...prev, email: e.target.value }))}
                className="h-11 w-full border border-[#3C3B3F] bg-[#F7F6F3] px-3 text-sm outline-none focus:border-[#1F1F22]"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={resetPersonalInfo}
              className="h-11 border border-[#3C3B3F] bg-[#F5F4F1] text-xs font-semibold uppercase tracking-wider text-[#1F1F22] hover:bg-[#ECEAE4]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => toast.success("Profile changes saved.")}
              className="h-11 bg-[#1F1F22] text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#111]"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationsPanel = () => {
    const rows: {
      label: string;
      whatsappKey: keyof NotificationSettings;
      emailKey: keyof NotificationSettings;
    }[] = [
        {
          label: "Order updates and tracking",
          whatsappKey: "orderUpdatesWhatsapp",
          emailKey: "orderUpdatesEmail",
        },
        {
          label: "Messages from buyers/sellers",
          whatsappKey: "messagesWhatsapp",
          emailKey: "messagesEmail",
        },
        {
          label: "New offers and bids",
          whatsappKey: "offersWhatsapp",
          emailKey: "offersEmail",
        },
        {
          label: "Promotions and sales",
          whatsappKey: "promotionsWhatsapp",
          emailKey: "promotionsEmail",
        },
        {
          label: "Direct messages",
          whatsappKey: "directMessagesWhatsapp",
          emailKey: "directMessagesEmail",
        },
        {
          label: "Item sold alerts",
          whatsappKey: "soldAlertsWhatsapp",
          emailKey: "soldAlertsEmail",
        },
      ];

    const toggle = (key: keyof NotificationSettings) => {
      setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const Toggle = ({
      checked,
      onClick,
      label,
    }: {
      checked: boolean;
      onClick: () => void;
      label: string;
    }) => (
      <button
        type="button"
        onClick={onClick}
        role="switch"
        aria-label={label}
        className={`relative inline-flex h-6 w-10 items-center rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F22]/40 ${checked
          ? "border-[#F42824] bg-[#F42824]"
          : "border-[#CFC9BE] bg-[#D8D4CC]"
          }`}
        aria-pressed={checked}
      >
        <span
          className={`pointer-events-none inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-[3px]"
            }`}
        />
      </button>
    );

    return (
      <div className="border border-[#E6E2DA] bg-[#F4F3EF] p-4 lg:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Bell size={16} className="text-[#1F1F22]" />
          <h2 className="geist-mono-font text-[28px] font-semibold text-[#1F1F22]">Notifications</h2>
        </div>

        <div className="max-w-[560px]">
          <div className="mb-2 grid grid-cols-[minmax(0,1fr)_88px_88px] items-center text-xs font-semibold text-[#3B3835]">
            <span />
            <span className="justify-self-center">Whatsapp</span>
            <span className="justify-self-center">EMail</span>
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center">
                <p className="geist-mono-font text-[18px] text-[#1F1F22]">{row.label}</p>
                <div className="justify-self-center">
                  <Toggle
                    checked={notificationSettings[row.whatsappKey]}
                    onClick={() => toggle(row.whatsappKey)}
                    label={`${row.label} Whatsapp`}
                  />
                </div>
                <div className="justify-self-center">
                  <Toggle
                    checked={notificationSettings[row.emailKey]}
                    onClick={() => toggle(row.emailKey)}
                    label={`${row.label} Email`}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => toast.success("Notification preferences saved.")}
            className="mt-10 bg-[#1F1F22] px-6 py-3 text-sm font-semibold text-white hover:bg-[#111]"
          >
            Save Preferences
          </button>
        </div>
      </div>
    );
  };

  const renderPlaceholderPanel = (title: string, description: string) => (
    <div className="bg-[#F4F3EF] border border-[#E6E2DA] p-4 lg:p-6">
      <h2 className="anek-devanagari-font text-3xl font-semibold text-[#1F1F22]">{title}</h2>
      <p className="geist-mono-font mt-1 text-sm text-[#6E6A62]">{description}</p>
      <div className="mt-5 border border-dashed border-[#D7D3CC] bg-[#FBFAF8] p-6 text-sm text-[#6E6A62]">
        This section is ready. Connect it with live data/workflow next.
      </div>
    </div>
  );

  const renderRightPanel = () => {
    if (activeTab === "account-overview") return renderAccountOverviewPanel();
    if (activeTab === "my-orders") return renderOrdersPanel();
    if (activeTab === "saved-addresses") return renderSavedAddressesPanel();
    if (activeTab === "wishlist") return renderWishlistPanel();
    if (activeTab === "personal-information") return renderPersonalInformationPanel();
    if (activeTab === "account-details") {
      return renderPlaceholderPanel("Account Details", "Manage account profile and authentication preferences.");
    }
    if (activeTab === "notifications") return renderNotificationsPanel();
    if (activeTab === "settings") {
      return renderPlaceholderPanel("Settings", "Manage your account preferences and app configuration.");
    }
    if (activeTab === "my-listings") return renderMyListingsPanel();
    if (activeTab === "earnings") {
      return renderPlaceholderPanel("Earnings", "Track payouts, commissions, and statement history.");
    }
    if (activeTab === "buyer-protection") {
      return renderPlaceholderPanel("Buyer Protection", "Get support for eligible purchases and dispute handling.");
    }
    if (activeTab === "terms-of-use") {
      return renderPlaceholderPanel("Terms of Use", "Read marketplace terms and user responsibilities.");
    }
    return renderPlaceholderPanel("Privacy Center", "Control your privacy and data usage preferences.");
  };

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-[#ECE9E2]">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-r border-[#DDD8CF] pr-0 lg:pr-6">
              <div className="mb-5">
                <button
                  onClick={() => setActiveTab("account-overview")}
                  className={`geist-mono-font text-[15px] font-bold ${activeTab === "account-overview" ? "text-[#F42824]" : "text-[#1F1F22]"}`}
                >
                  Account
                </button>
                <p className={`mt-0 geist-mono-font text-[13px] ${activeTab === "account-overview" ? "text-[#F42824]" : "text-[#6E6A62]"}`}>
                  {fullName.toLowerCase()}
                </p>
              </div>

              <div className="space-y-5">
                {sidebarSections.map((section) => (
                  <div key={section.subtitle} className="border-b border-[#DDD8CF] pb-2">
                    <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[#9A968E] geist-mono-font">
                      {section.subtitle}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setActiveTab(item.key)}
                          className={`block w-full text-left text-sm geist-mono-font mb-3 ${activeTab === item.key
                            ? "font-semibold text-[#F42824]"
                            : "text-[#6E6A62] hover:text-[#1F1F22]"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogout}
                className="mt-8 flex items-center gap-2 text-xs uppercase tracking-widest text-[#6E6A62] hover:text-[#1F1F22]"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </aside>

            <section>{renderRightPanel()}</section>
          </div>
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
