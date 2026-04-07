import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";

export default function CollectionDetail() {
  const { handle } = useParams<{ handle: string }>();

  const { data, isLoading, error } = trpc.collections.byHandle.useQuery(
    { handle: handle!, first: 48 },
    { enabled: !!handle }
  );

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="container py-12">
          <div className="h-8 bg-muted rounded animate-pulse w-1/3 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-sm animate-pulse" />
            ))}
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (error || !data) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Collection Not Found
          </h1>
          <Link href="/collections">
            <Button className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white">
              View All Collections
            </Button>
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  const products = data.products?.nodes ?? [];

  return (
    <StorefrontLayout>
      {/* Header */}
      <div className="bg-[oklch(0.97_0.01_80)] py-10 sm:py-14">
        <div className="container">
          <Link href="/collections">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <ArrowLeft className="w-4 h-4" /> All Collections
            </button>
          </Link>
          {data.image && (
            <div className="w-full h-48 sm:h-64 rounded-sm overflow-hidden mb-6">
              <img src={data.image.url} alt={data.image.altText ?? data.title} className="w-full h-full object-cover" />
            </div>
          )}
          <p
            className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Collection
          </p>
          <h1
            className="text-3xl sm:text-5xl font-black text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {data.title}
          </h1>
          {data.description && (
            <p className="text-muted-foreground mt-2 max-w-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
              {data.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-8 sm:py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
              No products in this collection yet.
            </p>
            <Link href="/products">
              <Button className="mt-4 bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
