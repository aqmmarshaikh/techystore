"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryService } from "@/services/category.service";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

const MOCK_CATEGORIES = [
  { id: "electronics", name: "Electronics", description: "Smartphones, laptops, and accessories" },
  { id: "fashion", name: "Fashion", description: "Trendy clothing for men and women" },
  { id: "home", name: "Home & Furniture", description: "Decor, appliances, and furniture" },
  { id: "beauty", name: "Beauty & Personal Care", description: "Skincare, makeup, and grooming" },
  { id: "sports", name: "Sports & Outdoors", description: "Fitness equipment and outdoor gear" },
  { id: "books", name: "Books", description: "Fiction, non-fiction, and educational" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getAllCategories();
        const activeCategories = data
          .filter((c) => c.isActive !== false && c.name)
          .map((c) => ({
            id: c.id,
            name: c.name as string,
            description: c.description,
            isActive: c.isActive,
          }));
        setCategories(activeCategories.length > 0 ? activeCategories : MOCK_CATEGORIES);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4">
          Shop by Category
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse our wide selection of products across various categories to find exactly what you're looking for.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 p-6 rounded-2xl border bg-card">
              <Skeleton className="w-12 h-12 rounded-full mb-2" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-3xl border border-dashed">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <PackageSearch className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We are currently updating our catalog. Please check back later for new categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group block"
            >
              <div className="h-full p-8 rounded-3xl border bg-card/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-card hover:border-primary/20">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <span className="text-2xl font-bold uppercase">
                    {category.name.substring(0, 1)}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  Browse products &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-20 text-center bg-slate-50 p-12 rounded-3xl">
        <h2 className="text-2xl font-bold mb-4">Can't find what you need?</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Try searching all our products or contact our support team for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/products">View All Products</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="rounded-full px-8 bg-white">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
