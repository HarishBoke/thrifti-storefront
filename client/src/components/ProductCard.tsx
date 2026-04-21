import { Link } from "wouter";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import { trpc } from "@/lib/trpc";
import type { ShopifyProduct } from "@shared/shopifyTypes";
import { formatPrice } from "@shared/shopifyTypes";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading: cartLoading } = useCart();
  const { customer, isAuthenticated } = useShopifyAuth();

  const utils = trpc.useUtils();

  const image = product.featuredImage;
  const minPrice = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const firstVariant = product.variants.nodes[0];
  const hasDiscount =
    firstVariant?.compareAtPrice &&
    parseFloat(firstVariant.compareAtPrice.amount) > parseFloat(minPrice.amount);

  const priceDisplay =
    minPrice.amount !== maxPrice.amount
      ? `${formatPrice(minPrice.amount, minPrice.currencyCode)} – ${formatPrice(maxPrice.amount, maxPrice.currencyCode)}`
      : formatPrice(minPrice.amount, minPrice.currencyCode);

  // Wishlist state — check if this product is already in the wishlist
  const { data: wishlistItems } = trpc.wishlist.list.useQuery(
    { customerEmail: customer?.email ?? "" },
    { enabled: !!customer?.email && isAuthenticated }
  );
  const isWishlisted = wishlistItems?.some((w) => w.productId === product.id) ?? false;

  const addWishlistMutation = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate();
      toast.success("Added to wishlist");
    },
    onError: (err) => toast.error(err.message || "Failed to add to wishlist"),
  });

  const removeWishlistMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate();
      toast.success("Removed from wishlist");
    },
    onError: (err) => toast.error(err.message || "Failed to remove from wishlist"),
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    try {
      await addToCart(firstVariant.id, 1);
      toast.success(`${product.title} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !customer?.email) {
      toast.info("Sign in to save items to your wishlist", {
        action: { label: "Sign In", onClick: () => (window.location.href = "/login") },
      });
      return;
    }
    if (isWishlisted) {
      removeWishlistMutation.mutate({ customerEmail: customer.email, productId: product.id });
    } else {
      addWishlistMutation.mutate({
        customerEmail: customer.email,
        productId: product.id,
        productHandle: product.handle,
        productTitle: product.title,
        productImage: image?.url ?? undefined,
        productPrice: priceDisplay,
      });
    }
  };

  const wishlistPending = addWishlistMutation.isPending || removeWishlistMutation.isPending;

  return (
    <Link href={`/products/${product.handle}`}>
      <article className="group cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-2">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!product.availableForSale && (
              <span
                className="text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider bg-[var(--thrifti-dark)] font-['Space_Grotesk']"
              >
                Sold Out
              </span>
            )}
            {hasDiscount && (
              <span
                className="text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider bg-[var(--thrifti-red)] font-['Space_Grotesk']"
              >
                Sale
              </span>
            )}
          </div>

          {/* Quick Add */}
          {product.availableForSale && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="absolute bottom-0 left-0 right-0 text-white text-[10px] font-black py-2.5 tracking-[0.15em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50 bg-[var(--thrifti-dark)] font-['Space_Grotesk']"
            >
              {cartLoading ? "Adding..." : "Quick Add"}
            </button>
          )}

          {/* Wishlist heart */}
          <button
            className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center transition-all duration-200 ${
              isWishlisted
                ? "opacity-100 bg-white"
                : "opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white"
            } ${wishlistPending ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleWishlist}
            disabled={wishlistPending}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              fill={isWishlisted ? "var(--thrifti-red)" : "none"}
              className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? "text-[var(--thrifti-red)]" : "text-[var(--thrifti-dark)]"}`}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-0.5">
          {product.vendor && (
            <p
              className="text-[10px] uppercase tracking-widest mb-0.5 font-['Space_Grotesk'] text-[var(--thrifti-red)]"
            >
              {product.vendor}
            </p>
          )}
          <h3
            className="text-xs sm:text-sm font-bold line-clamp-2 mb-1 leading-snug font-['Space_Grotesk'] text-[var(--thrifti-dark)]"
          >
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-black font-['Space_Grotesk'] text-[var(--thrifti-dark)]"
            >
              {priceDisplay}
            </span>
            {hasDiscount && firstVariant?.compareAtPrice && (
              <span
                className="text-xs line-through text-muted-foreground font-['Space_Mono']"
              >
                {formatPrice(firstVariant.compareAtPrice.amount, firstVariant.compareAtPrice.currencyCode)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
