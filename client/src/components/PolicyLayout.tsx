import StorefrontLayout from "@/components/StorefrontLayout";
import { ReactNode } from "react";

interface PolicyLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: ReactNode;
}

export default function PolicyLayout({ title, subtitle, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <div className="bg-[oklch(0.12_0.01_260)] text-white py-14 sm:py-20">
        <div className="container max-w-3xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-6xl font-black mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/70 text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="text-white/40 text-xs mt-3 tracking-widest uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-3xl mx-auto py-12 sm:py-16">
        <div
          className="prose prose-sm sm:prose-base max-w-none
            prose-headings:font-black prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-li:text-muted-foreground prose-li:leading-relaxed
            prose-strong:text-foreground
            prose-a:text-[oklch(0.52_0.22_25)] prose-a:underline"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {children}
        </div>
      </div>
    </StorefrontLayout>
  );
}
