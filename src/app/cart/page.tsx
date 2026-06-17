"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  if (items.length === 0) {
    return (
      <ClientOnly>
        <main className="container mx-auto px-4 py-16 md:py-24 text-center max-w-2xl">
          <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </main>
      </ClientOnly>
    );
  }

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 999 ? 0 : 50; // Mock rule
  const total = subtotal + deliveryFee;

  return (
    <ClientOnly>
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-sm bg-card/50">
            <CardHeader className="flex flex-row justify-between items-center py-4 border-b">
              <CardTitle className="text-lg">Cart Items ({items.length})</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
                Clear all
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variantId}`} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative w-24 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                            {item.title}
                          </Link>
                          <div className="mt-1 flex items-center text-sm text-muted-foreground">
                            {item.stock > 0 ? (
                              <span className="text-green-600">In stock</span>
                            ) : (
                              <span className="text-destructive">Out of stock</span>
                            )}
                          </div>
                        </div>
                        <div className="font-semibold text-lg text-right">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-full overflow-hidden w-fit">
                          <button 
                            className="px-3 py-1 hover:bg-muted transition-colors disabled:opacity-50"
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            className="px-3 py-1 hover:bg-muted transition-colors disabled:opacity-50"
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.productId, item.variantId)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm bg-card/50 sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                {deliveryFee === 0 ? (
                  <span className="font-medium text-green-600">Free</span>
                ) : (
                  <span className="font-medium">₹{deliveryFee.toLocaleString()}</span>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full rounded-full" asChild>
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
    </ClientOnly>
  );
}
