"use client";

import Image from "next/image";
import Link from "next/link";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Truck, CheckCircle2, CreditCard, Package } from "lucide-react";
import { db } from "@/firebase/config";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { ClientOnly } from "@/components/ui/client-only";

export default function CheckoutPage() {
  const router = useRouter();
  const { profile, user } = useAuthStore();
  const { items, getCartTotal, clearCart } = useCartStore();
  
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Delivery Slot, 3: Confirm
  const [selectedAddress, setSelectedAddress] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string>("Morning (10 AM - 1 PM)");
  const [isProcessing, setIsProcessing] = useState(false);
  if (items.length === 0) return null;

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 999 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!profile || !user) {
      toast.error("Please login to place an order");
      return;
    }

    if (!profile.addresses || profile.addresses.length === 0) {
      toast.error("Please add a delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      const address = profile.addresses[selectedAddress];
      
      const orderData = {
        userId: user.uid,
        customerName: profile.name,
        customerEmail: profile.email,
        customerPhone: profile.phone || address.phone || "",
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId || null,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        discount: 0,
        deliveryFee,
        total,
        paymentMethod: "COD",
        status: "Pending",
        shippingAddress: address,
        deliverySlot: selectedSlot,
        trackingHistory: [
          { status: "Pending", timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create order
      const orderRef = await addDoc(collection(db, "orders"), orderData);

      // Add to user's orders collection or just let the user fetch by userId
      // Reduce product stock
      for (const item of items) {
        // Simple stock reduction (In real app, needs transaction and variant handling)
        const productRef = doc(db, "products", item.productId);
        await updateDoc(productRef, {
          stock: increment(-item.quantity)
        });
      }

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/profile?tab=orders&highlight=${orderRef.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const deliverySlots = [
    "Morning (10 AM - 1 PM)",
    "Afternoon (1 PM - 4 PM)",
    "Evening (4 PM - 7 PM)",
    "Night (7 PM - 10 PM)"
  ];

  return (
    <ClientOnly>
      <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          <Card className={`border-2 ${step === 1 ? "border-primary" : "border-border"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> 
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.addresses?.length ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.addresses.map((address: any, idx: number) => {
                      const getLabelBadge = (label: string) => {
                        if (!label) return null;
                        if (label.toLowerCase() === "home") return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Home</Badge>;
                        if (label.toLowerCase() === "office") return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none">Office</Badge>;
                        return <Badge variant="secondary">{label}</Badge>;
                      };

                      return (
                        <div 
                          key={idx}
                          className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress === idx ? "border-primary bg-primary/5 shadow-md" : "border-slate-200 hover:border-primary/50"}`}
                          onClick={() => setSelectedAddress(idx)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-bold">{address.fullName}</p>
                              {getLabelBadge(address.label || (idx === 0 ? "Home" : "Office"))}
                            </div>
                            {selectedAddress === idx && <CheckCircle2 className="w-6 h-6 text-primary absolute top-4 right-4" />}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1 mb-4">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.postalCode}</p>
                            <p>India</p>
                            <p className="font-medium text-foreground mt-2">Phone: {address.phone}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs" 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push("/profile?tab=addresses");
                              }}
                            >
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={(e) => {
                              e.stopPropagation();
                              toast.info("Delivery instructions feature coming soon!");
                            }}>Add Delivery Instructions</Button>
                          </div>

                        </div>
                      );
                    })}
                    
                    {/* Add New Address Card */}
                    <div 
                      className="p-5 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer h-full min-h-[200px]"
                      onClick={() => router.push("/profile?tab=addresses")}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <MapPin className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="font-medium">Add New Address</p>
                    </div>
                  </div>

                  {step === 1 && (
                    <div className="pt-4 flex justify-end">
                      <Button onClick={() => setStep(2)} size="lg" className="w-full sm:w-auto px-8 rounded-full">Use this address</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-6">No addresses found. Please add a delivery address to continue.</p>
                  <Button asChild>
                    <Link href="/profile">Add New Address</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Delivery Slot */}
          <Card className={`border-2 ${step === 2 ? "border-primary" : "border-border"} ${step < 2 && "opacity-50 pointer-events-none"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> 
                Delivery Slot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deliverySlots.map((slot) => (
                  <div 
                    key={slot}
                    className={`p-4 border rounded-xl cursor-pointer text-center transition-all ${selectedSlot === slot ? "border-primary bg-primary/5 font-medium text-primary" : "hover:border-primary/50"}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </div>
                ))}
              </div>
              {step === 2 && (
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-1">Continue to Payment</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Payment */}
          <Card className={`border-2 ${step === 3 ? "border-primary" : "border-border"} ${step < 3 && "opacity-50 pointer-events-none"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> 
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary">COD</span>
                  </div>
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>

              {step === 3 && (
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={isProcessing}>Back</Button>
                  <Button onClick={handlePlaceOrder} className="flex-[2]" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Place Order (₹${total.toLocaleString()})`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-none shadow-sm bg-card/50">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{items.length} items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center text-slate-400">
                      {item.image ? (
                        <Image src={item.image} alt={item.title || "Product"} fill className="object-cover" />
                      ) : (
                        <Package className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-2">{item.title}</p>
                      <div className="flex justify-between mt-1 text-muted-foreground">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-medium text-green-600">Free</span>
                  ) : (
                    <span className="font-medium">₹{deliveryFee.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ClientOnly>
  );
}
