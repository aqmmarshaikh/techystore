import { notFound } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { ProductDetailsClient } from "@/features/products/components/ProductDetailsClient";
import { ProductCard } from "@/features/products/components/ProductCard";
import { RecentlyViewedCarousel } from "@/features/products/components/RecentlyViewedCarousel";
import { ProductReviews } from "@/features/products/components/ProductReviews";

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Ensure this runs dynamically or generates statically based on known IDs
// For now, we fetch on demand.

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  // Try to fetch from DB
  let product = await ProductService.getProductById(id).catch(() => null);

  // Fallback to mock data if not found (for demonstration before DB is populated)
  if (!product && id === "1") {
    product = {
      id: "1",
      title: "Premium Wireless Headphones",
      slug: "premium-wireless-headphones",
      description: "High quality noise-cancelling headphones. Experience pure audio bliss with our flagship wireless headphones. Features include active noise cancellation, 30-hour battery life, and ultra-comfortable memory foam ear cushions. Perfect for audiophiles and travelers alike.",
      price: 12999,
      salePrice: 9999,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"
      ],
      categoryId: "electronics",
      stock: 10,
      rating: 4.8,
      reviewsCount: 124,
      featured: true,
      isActive: true,
      tags: ["audio", "wireless"],
      variants: [
        { id: "v1", name: "Matte Black", priceAdjustment: 0, stock: 5 },
        { id: "v2", name: "Silver", priceAdjustment: 500, stock: 5 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else if (!product && id === "2") {
    product = {
      id: "2",
      title: "Minimalist Smartwatch",
      slug: "minimalist-smartwatch",
      description: "Sleek and elegant smartwatch for everyday use. Features fitness tracking, heart rate monitoring, and a 7-day battery life.",
      price: 8999,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
      ],
      categoryId: "electronics",
      stock: 15,
      rating: 4.5,
      reviewsCount: 89,
      featured: true,
      isActive: true,
      tags: ["wearable", "smartwatch"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (!product) {
    notFound();
  }

  // Fetch related products (mocked for now)
  const relatedProducts = [
    {
      id: "2",
      title: "Minimalist Smartwatch",
      slug: "minimalist-smartwatch",
      description: "Sleek and elegant smartwatch for everyday use.",
      price: 8999,
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"],
      categoryId: "electronics",
      stock: 5,
      rating: 4.5,
      reviewsCount: 89,
      featured: true,
      isActive: true,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <ProductDetailsClient product={product} />

      <ProductReviews productId={product.id} />

      {/* Related Products */}
      <section className="mt-24">
        <h2 className="text-2xl font-bold tracking-tight mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      </section>

      <RecentlyViewedCarousel currentProductId={product.id} />
    </main>
  );
}
