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



  if (!product) {
    notFound();
  }

  // Fetch real related products
  let relatedProducts = await ProductService.getProducts({ categoryId: product.categoryId }).catch(() => []);
  // Filter out the current product
  relatedProducts = relatedProducts.filter((p: any) => p.id !== product?.id).slice(0, 4);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <ProductDetailsClient product={product} />

      <ProductReviews productId={product.id} />

      {/* Related Products */}
      <section className="mt-24">
        <h2 className="text-2xl font-bold tracking-tight mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p: any) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      </section>

      <RecentlyViewedCarousel currentProductId={product.id} />
    </main>
  );
}
