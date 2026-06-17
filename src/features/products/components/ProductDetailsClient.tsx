"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { toast } from "sonner";
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0] || "/placeholder.jpg");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const addRecentlyViewed = useRecentlyViewedStore((state) => state.addItem);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);

  const currentPrice = selectedVariant 
    ? (product.salePrice || product.price) + selectedVariant.priceAdjustment
    : (product.salePrice || product.price);

  const originalPrice = selectedVariant
    ? product.price + selectedVariant.priceAdjustment
    : product.price;

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    if (currentStock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    addItem({
      id: `${product.id}${selectedVariant ? `-${selectedVariant.id}` : ""}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      title: `${product.title}${selectedVariant ? ` - ${selectedVariant.name}` : ""}`,
      price: currentPrice,
      image: selectedImage,
      quantity,
      stock: currentStock,
    });

    toast.success("Added to cart");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted border">
          <Image
            src={selectedImage}
            alt={product.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {product.featured && <Badge variant="secondary" className="bg-primary/10 text-primary">Featured</Badge>}
            {product.salePrice && <Badge variant="destructive">Sale</Badge>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {product.title}
          </h1>
          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <a href="#reviews" className="flex items-center gap-2 group cursor-pointer">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-medium group-hover:underline transition-all">
                {product.rating?.toFixed(1)} ({product.reviewsCount} reviews)
              </span>
            </a>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight">₹{currentPrice.toLocaleString()}</span>
            {product.salePrice && (
              <span className="text-lg text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-8">
          {product.description}
        </p>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-3">Options</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-2 text-sm rounded-full border transition-all ${
                    selectedVariant?.id === variant.id
                      ? "border-primary bg-primary text-primary-foreground font-medium"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Separator className="mb-8" />

        {/* Actions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-full overflow-hidden">
              <button 
                className="px-4 py-2 hover:bg-muted transition-colors disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button 
                className="px-4 py-2 hover:bg-muted transition-colors disabled:opacity-50"
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
              >
                +
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStock > 0 ? (
                <span className="text-green-600 font-medium">{currentStock} in stock</span>
              ) : (
                <span className="text-destructive font-medium">Out of stock</span>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="flex-1 rounded-full text-base h-12 transition-transform active:scale-95"
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className={`rounded-full w-12 p-0 h-12 transition-colors ${
                isMounted && isInWishlist(product.id) 
                  ? "border-red-500 bg-red-50 hover:bg-red-100" 
                  : ""
              }`}
              onClick={() => {
                if (isInWishlist(product.id)) {
                  removeWishlist(product.id);
                  toast.success("Removed from wishlist");
                } else {
                  addWishlist(product);
                  toast.success("Added to wishlist");
                }
              }}
            >
              <Heart 
                className={`w-5 h-5 ${
                  isMounted && isInWishlist(product.id) 
                    ? "fill-red-500 text-red-500" 
                    : "text-foreground"
                }`} 
              />
            </Button>
          </div>
        </div>

        {/* Delivery & Returns Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-card/50">
            <Truck className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-muted-foreground">On orders over ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-card/50">
            <RotateCcw className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-muted-foreground">7 Days return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
