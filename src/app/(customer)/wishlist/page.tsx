"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items: wishlistItems } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl flex items-center">
            <Heart className="mr-3 w-8 h-8 text-primary fill-primary/20" />
            My Wishlist
          </h1>
          <p className="mt-2 text-muted-foreground">
            Save your favorite items and track their availability.
          </p>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-3xl border border-dashed">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            You haven't saved any items yet. Browse our products and click the heart icon to save them here.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 h-12">
            <Link href="/products">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
