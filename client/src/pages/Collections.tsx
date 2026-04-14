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
      <div className="pt-6 lg:pt-10">
        <div className="container">
          <p
            className="text-[#F42824] text-3xl font-medium anek-devanagari-font underline"
          >
            Browse
          </p>
          <h1
            className="vogue-font uppercase leading-tight text-3xl sm:text-4xl lg:text-5xl text-foreground"
          >
            Collections
          </h1>
          <p className="text-muted-foreground anek-devanagari-font mt-1">
            Curated categories of pre-loved fashion, handpicked for every style.
          </p>
        </div>
      </div>

      <div className="container pb-8 lg:pb-18 pt-6 lg:pt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-sm animate-pulse" />
            ))}
          </div>
        ) : !collections?.length ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-['Inter',sans-serif]">
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
                        className="text-4xl font-black text-[oklch(0.52_0.22_25)]/30 font-['Playfair_Display',serif]"
                      >
                        {collection.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2
                      className="text-white font-semibold text-lg lg:text-xl anek-devanagari-font"
                    >
                      {collection.title}
                    </h2>
                    {collection.description && (
                      <p className="text-white/70 text-sm line-clamp-2 geist-mono-font">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-white/70 text-xs group-hover:text-white transition-colors geist-mono-font">
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
