import { useState, useEffect, useMemo } from "react";
import { useSearch } from "wouter";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StorefrontLayout from "@/components/StorefrontLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";

const SORT_OPTIONS = [
  { label: "Newest First", sortKey: "CREATED_AT", reverse: true },
  { label: "Oldest First", sortKey: "CREATED_AT", reverse: false },
  { label: "Price: Low to High", sortKey: "PRICE", reverse: false },
  { label: "Price: High to Low", sortKey: "PRICE", reverse: true },
  { label: "Best Selling", sortKey: "BEST_SELLING", reverse: false },
  { label: "A–Z", sortKey: "TITLE", reverse: false },
];

export default function Products() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialQuery = params.get("q") ?? "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [sortIndex, setSortIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const currentSort = SORT_OPTIONS[sortIndex];

  const { data, isLoading, error } = trpc.products.list.useQuery({
    first: 48,
    query: activeQuery || undefined,
    sortKey: currentSort?.sortKey,
    reverse: currentSort?.reverse,
  });

  const products = data?.products ?? [];

  // Extract unique product types for filter
  const productTypes = useMemo(() => {
    const types = new Set(products.map((p) => p.productType).filter(Boolean));
    return Array.from(types).sort();
  }, [products]);

  // Client-side filter by type
  const filteredProducts = useMemo(() => {
    if (selectedTypes.length === 0) return products;
    return products.filter((p) => selectedTypes.includes(p.productType));
  }, [products, selectedTypes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveQuery("");
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <StorefrontLayout>
      {/* Page Header */}
      <div className="bg-[oklch(0.97_0.01_80)] py-10 sm:py-14">
        <div className="container">
          <p
            className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Circular Fashion
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-foreground mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {activeQuery ? `Results for "${activeQuery}"` : "Shop All"}
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isLoading ? "Loading..." : `${filteredProducts.length} items`}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search + Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white"
            >
              Search
            </Button>
          </form>

          {/* Filter Toggle */}
          {productTypes.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 shrink-0"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {selectedTypes.length > 0 && (
                <span className="bg-[oklch(0.52_0.22_25)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedTypes.length}
                </span>
              )}
            </Button>
          )}

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowSortDropdown((v) => !v)}
              className="flex items-center gap-2 min-w-[160px] justify-between"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-sm">{currentSort?.label}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-md shadow-lg z-20 min-w-[200px]">
                {SORT_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setSortIndex(i); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${i === sortIndex ? "text-[oklch(0.52_0.22_25)] font-semibold" : ""}`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && productTypes.length > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-md border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Filter by Category
              </h3>
              {selectedTypes.length > 0 && (
                <button
                  onClick={() => setSelectedTypes([])}
                  className="text-xs text-[oklch(0.52_0.22_25)] hover:underline"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {productTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    selectedTypes.includes(type)
                      ? "bg-[oklch(0.52_0.22_25)] text-white border-[oklch(0.52_0.22_25)]"
                      : "bg-white text-foreground border-border hover:border-foreground"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(activeQuery || selectedTypes.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Active filters:</span>
            {activeQuery && (
              <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-xs">
                Search: "{activeQuery}"
                <button onClick={clearSearch}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedTypes.map((type) => (
              <span key={type} className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-xs">
                {type}
                <button onClick={() => toggleType(type)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(12).fill(null).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-sm animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Unable to load products
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your Shopify connection and try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white"
            >
              Retry
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-medium mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No products found
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {activeQuery ? `No results for "${activeQuery}"` : "No products available yet."}
            </p>
            {activeQuery && (
              <Button
                onClick={clearSearch}
                variant="outline"
                className="border-foreground"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
