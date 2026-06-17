import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductService } from "@/services/product.service";
import { ShieldCheck, Truck, Clock, CreditCard } from "lucide-react";

export default async function Home() {
  // Fetch featured products from Firebase (will be empty initially)
  const featuredProducts = await ProductService.getFeaturedProducts(4).catch(() => []);

  // Mock data for initial UI rendering before database is populated
  const mockProducts = [
    {
      id: "1",
      title: "Premium Wireless Headphones",
      slug: "premium-wireless-headphones",
      description: "High quality noise-cancelling headphones.",
      price: 12999,
      salePrice: 9999,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"],
      categoryId: "electronics",
      stock: 10,
      rating: 4.8,
      reviewsCount: 124,
      featured: true,
      isActive: true,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
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
    },
  ];

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : mockProducts;

  return (
    <main className="flex min-h-screen flex-col items-center w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-slate-50 py-24 lg:py-32 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Elevate Your Lifestyle
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Discover our curated collection of premium products designed for the modern individual. Experience quality, elegance, and simplicity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="rounded-full px-8 text-base h-12" asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-12 bg-white" asChild>
                <Link href="/categories">View Categories</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </section>

      {/* Features Section (Why Choose Us) */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Free shipping on orders over ₹999</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">100% secure Cash on Delivery</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Dedicated customer assistance</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">Hassle-free 7 days return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground mt-2">Handpicked for you</p>
            </div>
            <Button variant="link" asChild className="hidden sm:flex">
              <Link href="/products">View All &rarr;</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-8 sm:hidden" asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="w-full py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold md:text-4xl">Special Festival Offer!</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Get up to 40% off on all electronics this week. Use code FESTIVAL40 at checkout.
          </p>
          <Button variant="secondary" size="lg" className="rounded-full mt-4 text-primary">
            Claim Offer
          </Button>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="w-full py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">What Our Customers Say</h2>
            <p className="text-muted-foreground mt-4">Don't just take our word for it. Here is what our community thinks about FreshMart.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Rahul S.", review: "Absolutely love the premium quality! The headphones I bought exceeded my expectations. Fast delivery too.", rating: 5 },
              { name: "Priya M.", review: "The customer service is outstanding. I had an issue with my order and Ammar sorted it out within minutes.", rating: 5 },
              { name: "Vikram K.", review: "Clean app, smooth checkout, and no hidden fees. Finally a reliable marketplace I can trust.", rating: 4 },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg key={idx} className={`w-5 h-5 ${idx < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-6">"{t.review}"</p>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">Verified Buyer</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full py-24 bg-white border-t">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Stay Updated</h2>
          <p className="text-muted-foreground">
            Subscribe to our newsletter to get updates on new products and exclusive offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex h-12 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
              required
              suppressHydrationWarning
            />
            <Button type="submit" className="rounded-full h-12 px-8">Subscribe</Button>
          </form>
        </div>
      </section>
    </main>
  );
}
