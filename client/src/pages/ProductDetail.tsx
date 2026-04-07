import { useState } from "react";
import { useParams, Link } from "wouter";
import { ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@shared/shopifyTypes";
import { toast } from "sonner";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const { addToCart, isLoading: cartLoading } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading, error } = trpc.products.byHandle.useQuery(
    { handle: handle! },
    { enabled: !!handle }
  );

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-muted rounded-sm animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (error || !product) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-6">This product may have been sold or removed.</p>
          <Link href="/products">
            <Button className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white">
              Browse All Products
            </Button>
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  const images = product.images.nodes;
  const currentImage = images[selectedImageIndex] ?? product.featuredImage;
  const variants = product.variants.nodes;

  // Find matching variant based on selected options
  const matchingVariant = variants.find((v) =>
    v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
  ) ?? variants[0];

  const activeVariantId = selectedVariantId ?? matchingVariant?.id ?? null;
  const activeVariant = variants.find((v) => v.id === activeVariantId) ?? matchingVariant;

  const price = activeVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAtPrice = activeVariant?.compareAtPrice;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const isAvailable = activeVariant?.availableForSale ?? product.availableForSale;

  const handleOptionSelect = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    const newVariant = variants.find((v) =>
      v.selectedOptions.every((opt) => newOptions[opt.name] === opt.value)
    );
    if (newVariant) setSelectedVariantId(newVariant.id);
  };

  const handleAddToCart = async () => {
    if (!activeVariantId) return;
    try {
      await addToCart(activeVariantId, 1);
      setAddedToCart(true);
      toast.success(`${product.title} added to cart!`);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const prevImage = () => setSelectedImageIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setSelectedImageIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <StorefrontLayout>
      <div className="container py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden bg-muted rounded-sm group">
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.altText ?? product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {!isAvailable && (
                  <span className="bg-foreground text-background text-xs font-semibold px-2.5 py-1 rounded-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Sold Out
                  </span>
                )}
                {isOnSale && (
                  <span className="bg-[oklch(0.52_0.22_25)] text-white text-xs font-semibold px-2.5 py-1 rounded-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    On Sale
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden border-2 transition-colors ${
                      i === selectedImageIndex
                        ? "border-[oklch(0.52_0.22_25)]"
                        : "border-transparent hover:border-border"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText ?? `Product image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Brand */}
            {product.vendor && (
              <p
                className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {product.vendor}
              </p>
            )}

            {/* Title */}
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-3 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {formatPrice(price.amount, price.currencyCode)}
              </span>
              {isOnSale && compareAtPrice && (
                <span
                  className="text-lg text-muted-foreground line-through"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                </span>
              )}
              {isOnSale && compareAtPrice && (
                <span className="bg-[oklch(0.52_0.22_25)] text-white text-xs font-bold px-2 py-0.5 rounded-sm">
                  SALE
                </span>
              )}
            </div>

            {/* Options / Variants */}
            {product.options
              .filter((opt) => opt.values.length > 1 || opt.values[0] !== "Default Title")
              .map((option) => (
                <div key={option.name} className="mb-5">
                  <p
                    className="text-sm font-semibold mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {option.name}:{" "}
                    <span className="font-normal text-muted-foreground">
                      {selectedOptions[option.name] ?? option.values[0]}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected =
                        (selectedOptions[option.name] ?? option.values[0]) === value;
                      // Check if this option value is available
                      const variantForValue = variants.find((v) =>
                        v.selectedOptions.some(
                          (o) => o.name === option.name && o.value === value
                        )
                      );
                      const isOptionAvailable = variantForValue?.availableForSale ?? true;

                      return (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(option.name, value)}
                          disabled={!isOptionAvailable}
                          className={`px-3 py-1.5 text-sm border rounded-sm transition-all ${
                            isSelected
                              ? "bg-foreground text-background border-foreground"
                              : isOptionAvailable
                              ? "bg-white text-foreground border-border hover:border-foreground"
                              : "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed line-through"
                          }`}
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Add to Cart */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={!isAvailable || cartLoading}
                className={`flex-1 py-3 text-base font-semibold transition-all ${
                  addedToCart
                    ? "bg-green-600 hover:bg-green-600 text-white"
                    : "bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {addedToCart ? (
                  <>
                    <Check className="mr-2 w-4 h-4" /> Added to Cart
                  </>
                ) : !isAvailable ? (
                  "Sold Out"
                ) : cartLoading ? (
                  "Adding..."
                ) : (
                  <>
                    <ShoppingBag className="mr-2 w-4 h-4" /> Add to Cart
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="px-3 border-border"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {product.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-t border-border pt-5">
                <h2
                  className="text-sm font-semibold mb-3 uppercase tracking-wider"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Description
                </h2>
                <div
                  className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            )}

            {/* Shipping Info */}
            <div className="mt-5 p-4 bg-muted/50 rounded-sm border border-border">
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="flex items-start gap-2">
                  <span className="text-[oklch(0.52_0.22_25)]">✓</span>
                  <span>Verified pre-owned item</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[oklch(0.52_0.22_25)]">✓</span>
                  <span>Secure checkout via Shopify</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[oklch(0.52_0.22_25)]">✓</span>
                  <span>Pan-India delivery</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[oklch(0.52_0.22_25)]">✓</span>
                  <span>Easy returns policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
