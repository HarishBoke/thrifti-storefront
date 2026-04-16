import type { ReactNode } from "react";

type RecentlyViewedGridProps<T> = {
  items: T[];
  title?: string;
  renderItem: (item: T) => ReactNode;
};

export default function RecentlyViewedGrid<T>({
  items,
  title = "Recently Viewed",
  renderItem,
}: RecentlyViewedGridProps<T>) {
  if (items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 pt-10 pb-4 sm:px-6 lg:px-10 lg:pb-15">
      <h2 className="anek-devanagari-font mb-2 text-3xl font-medium lg:text-[40px]">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {items.map((item) => renderItem(item))}
      </div>
    </div>
  );
}
