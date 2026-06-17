"use client";
import React, { useCallback } from "react";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    
    if (product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    addItem({
      id: `${product.id}`,
      productId: product.id,
      title: product.title,
      price: product.salePrice || product.price,
      image: product.images[0] || "/placeholder.jpg",
      quantity: 1,
      stock: product.stock,
    });
    
    toast.success(`${product.title} added to cart`);
  }, [product, addItem]);

  const discount = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group h-full overflow-hidden border-none bg-card/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {discount > 0 && (
              <Badge variant="destructive" className="font-semibold shadow-sm">
                {discount}% OFF
              </Badge>
            )}
            {product.featured && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 shadow-sm">
                Featured
              </Badge>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100 shadow-sm">
                Limited Stock
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-medium leading-tight tracking-tight text-foreground">
            {product.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold text-lg">
              ₹{product.salePrice ? product.salePrice.toLocaleString() : product.price.toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full rounded-full transition-transform active:scale-95" 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            variant={product.stock <= 0 ? "secondary" : "default"}
          >
            {product.stock <= 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
});
