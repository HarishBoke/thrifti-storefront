import { useState } from "react";
import { Link } from "wouter";
import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";

export default function Collections() {
  const { data: collections, isLoading } = trpc.collections.list.useQuery();

  return (
    <StorefrontLayout>
      {/* Page Header */}
      <div className="bg-[oklch(0.97_0.01_80)] py-10 sm:py-14">
        <div className="container">
          <p
            className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Browse
          </p>
          <h1
            className="text-3xl sm:text-5xl font-black text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Collections
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
            Curated categories of pre-loved fashion, handpicked for every style.
          </p>
        </div>
      </div>

      <div className="container py-8 sm:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-sm animate-pulse" />
            ))}
          </div>
        ) : !collections?.length ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
              No collections found. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.handle}`}>
                <div className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-muted cursor-pointer">
                  {collection.image ? (
                    <img
                      src={collection.image.url}
                      alt={collection.image.altText ?? collection.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[oklch(0.52_0.22_25)]/20 to-[oklch(0.52_0.22_25)]/5 flex items-center justify-center">
                      <span
                        className="text-4xl font-black text-[oklch(0.52_0.22_25)]/30"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {collection.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2
                      className="text-white font-black text-xl mb-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {collection.title}
                    </h2>
                    {collection.description && (
                      <p className="text-white/70 text-sm line-clamp-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-white/80 text-xs font-semibold group-hover:text-white transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Shop Collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
