"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { ProductCard } from "@/features/products/components/ProductCard";

interface RecentlyViewedCarouselProps {
  currentProductId: string;
}

export function RecentlyViewedCarousel({ currentProductId }: RecentlyViewedCarouselProps) {
  const { items } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const displayItems = items.filter(item => item.id !== currentProductId).slice(0, 4);

  if (displayItems.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold tracking-tight mb-8">Recently Viewed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayItems.map((p) => (
          <ProductCard key={p.id} product={p as any} />
        ))}
      </div>
    </section>
  );
}
