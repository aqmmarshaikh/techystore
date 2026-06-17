"use client";

import { useState, useEffect, useMemo } from "react";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X } from "lucide-react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Best Rating", value: "rating" },
] as const;

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "Over ₹10,000", min: 10000, max: Infinity },
];

const mockProducts: Product[] = [
  {
    id: "1", title: "Premium Wireless Headphones", slug: "premium-wireless-headphones",
    description: "High quality noise-cancelling headphones.", price: 12999, salePrice: 9999,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"],
    categoryId: "electronics", stock: 10, rating: 4.8, reviewsCount: 124, featured: true,
    isActive: true, tags: ["wireless", "audio"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "2", title: "Minimalist Smartwatch", slug: "minimalist-smartwatch",
    description: "Sleek and elegant smartwatch for everyday use.", price: 8999,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"],
    categoryId: "electronics", stock: 5, rating: 4.5, reviewsCount: 89, featured: true,
    isActive: true, tags: ["wearable"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "3", title: "Organic Cotton T-Shirt", slug: "organic-cotton-tshirt",
    description: "Comfortable everyday cotton tee.", price: 1299, salePrice: 899,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"],
    categoryId: "fashion", stock: 25, rating: 4.3, reviewsCount: 56, featured: false,
    isActive: true, tags: ["cotton", "eco"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "4", title: "Leather Messenger Bag", slug: "leather-messenger-bag",
    description: "Handcrafted genuine leather bag.", price: 4999,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80"],
    categoryId: "accessories", stock: 8, rating: 4.7, reviewsCount: 42, featured: true,
    isActive: true, tags: ["leather", "bag"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "5", title: "Ceramic Coffee Mug Set", slug: "ceramic-coffee-mug-set",
    description: "Set of 4 handpainted ceramic mugs.", price: 1599,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80"],
    categoryId: "home", stock: 15, rating: 4.6, reviewsCount: 38, featured: false,
    isActive: true, tags: ["kitchen", "ceramic"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "6", title: "Portable Bluetooth Speaker", slug: "portable-bluetooth-speaker",
    description: "Waterproof speaker with 20hr battery.", price: 3499, salePrice: 2499,
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80"],
    categoryId: "electronics", stock: 12, rating: 4.4, reviewsCount: 97, featured: true,
    isActive: true, tags: ["bluetooth", "audio"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("isActive", "==", true)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(fetched.length > 0 ? fetched : mockProducts);
      } catch {
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Price range filter
    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      result = result.filter((p) => {
        const price = p.salePrice || p.price;
        return price >= range.min && price < range.max;
      });
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case "price_desc":
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, searchQuery, sortBy, selectedPriceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPriceRange(null);
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedPriceRange !== null || sortBy !== "newest";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          Discover our curated collection of premium products
        </p>
      </div>

      {/* Search & Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full bg-muted/50 border-none h-11"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <div className="hidden sm:flex items-center border rounded-full p-0.5">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-6 bg-muted/30 rounded-2xl border animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Sort */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant={sortBy === opt.value ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-xs transition-colors hover:bg-primary/10"
                    onClick={() => setSortBy(opt.value)}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((range, idx) => (
                  <Badge
                    key={idx}
                    variant={selectedPriceRange === idx ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-xs transition-colors hover:bg-primary/10"
                    onClick={() =>
                      setSelectedPriceRange(selectedPriceRange === idx ? null : idx)
                    }
                  >
                    {range.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedPriceRange !== null && (
            <Badge variant="secondary" className="gap-1">
              {PRICE_RANGES[selectedPriceRange].label}
              <button onClick={() => setSelectedPriceRange(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {sortBy !== "newest" && (
            <Badge variant="secondary" className="gap-1">
              Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <button onClick={() => setSortBy("newest")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${filteredAndSorted.length} product${filteredAndSorted.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
          <Button variant="outline" onClick={clearFilters} className="rounded-full">
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "grid grid-cols-1 sm:grid-cols-2 gap-6"
          }
        >
          {filteredAndSorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
