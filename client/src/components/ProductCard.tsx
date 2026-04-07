import { Link } from "wouter";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { ShopifyProduct } from "@shared/shopifyTypes";
import { formatPrice } from "@shared/shopifyTypes";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();

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

  return (
    <Link href={`/products/${product.handle}`}>
      <article className="group cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm mb-3">
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
              <span className="bg-foreground text-background text-[10px] font-semibold px-2 py-0.5 rounded-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Sold Out
              </span>
            )}
            {hasDiscount && (
              <span className="bg-[oklch(0.52_0.22_25)] text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Sale
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          {product.availableForSale && (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="absolute bottom-0 left-0 right-0 bg-foreground text-background text-xs font-semibold py-2.5 tracking-wider uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isLoading ? "Adding..." : "Quick Add"}
            </button>
          )}

          {/* Wishlist */}
          <button
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            onClick={(e) => { e.preventDefault(); toast.info("Wishlist coming soon"); }}
            aria-label="Add to wishlist"
          >
            <Heart className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>

        {/* Product Info */}
        <div>
          {product.vendor && (
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {product.vendor}
            </p>
          )}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {priceDisplay}
            </span>
            {hasDiscount && firstVariant?.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through" style={{ fontFamily: "'Inter', sans-serif" }}>
                {formatPrice(firstVariant.compareAtPrice.amount, firstVariant.compareAtPrice.currencyCode)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
