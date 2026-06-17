"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Truck, CheckCircle2, MapPin, 
  PhoneCall, HelpCircle, Loader2, Store, Gift, Map, Star
} from "lucide-react";
import Link from "next/link";
import { OrderService } from "@/services/order.service";
import { format } from "date-fns";

const timelineSteps = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered"
];

export default function OrderTrackingPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const data = await OrderService.getOrderById(id!);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">Loading Order Tracking...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Package className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold">Order Not Found</h2>
        <Button asChild className="mt-4"><Link href="/orders">Go Back</Link></Button>
      </div>
    );
  }

  const normalizedStatus = (order.status || "pending").toLowerCase();
  
  const getCurrentStepIndex = () => {
    if (normalizedStatus === "pending") return 0;
    if (normalizedStatus === "processing") return 1;
    if (normalizedStatus === "shipped") return 3;
    if (normalizedStatus === "delivered") return 5;
    if (normalizedStatus === "cancelled") return -1;
    
    const idx = timelineSteps.findIndex(s => s.toLowerCase() === normalizedStatus);
    return idx === -1 ? 0 : idx;
  };

  const currentStep = getCurrentStepIndex();

  const getVisualizationState = () => {
    if (currentStep <= 1) return { icon: <Store className="w-16 h-16 text-blue-500 animate-pulse" />, text: "Preparing at Warehouse", color: "bg-blue-50" };
    if (currentStep === 2) return { icon: <Gift className="w-16 h-16 text-purple-500 animate-bounce" />, text: "Packaging your items", color: "bg-purple-50" };
    if (currentStep === 3) return { icon: <Truck className="w-16 h-16 text-orange-500 animate-[bounce_2s_infinite]" />, text: "In Transit", color: "bg-orange-50" };
    if (currentStep === 4) return { icon: <Map className="w-16 h-16 text-amber-500 animate-pulse" />, text: "Out for Delivery - Arriving Today", color: "bg-amber-50" };
    return { icon: <CheckCircle2 className="w-16 h-16 text-green-500" />, text: "Successfully Delivered", color: "bg-green-50" };
  };

  const vis = getVisualizationState();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(0,8).toUpperCase()}</h1>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm capitalize">{order.status || "Pending"}</Badge>
          </div>
          <p className="text-muted-foreground">
            Placed on {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "N/A"} 
            • Estimated Delivery: {order.createdAt ? format(new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000), "MMM d, yyyy") : "N/A"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/profile">
              <HelpCircle className="w-4 h-4 mr-2" />
              Need Help?
            </Link>
          </Button>
          <Button variant="outline" onClick={() => {
            toast.success("Downloading invoice...");
            setTimeout(() => toast.success("Invoice downloaded successfully"), 1500);
          }}>Download Invoice</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Amazon-Inspired Visualization */}
          <Card className="overflow-hidden border-2 shadow-sm">
            <div className={`w-full py-16 flex flex-col items-center justify-center transition-colors duration-500 ${vis.color}`}>
              <div className="bg-white p-6 rounded-full shadow-lg border mb-6">
                {vis.icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{vis.text}</h2>
              {currentStep === 4 && (
                <p className="text-amber-700 mt-2 font-medium">Your package is 3 stops away!</p>
              )}
            </div>
            
            <CardContent className="pt-8">
              <div className="relative flex justify-between mb-4">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2" />
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-1000 ease-in-out" 
                  style={{ width: `${(currentStep / (timelineSteps.length - 1)) * 100}%` }}
                />
                
                {timelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
                        isCompleted ? "bg-green-500 text-white" : "bg-white border-2 border-slate-200 text-slate-300"
                      } ${isCurrent ? "ring-4 ring-green-500/20" : ""}`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                      </div>
                      <span className={`absolute top-10 text-[10px] sm:text-xs font-semibold w-20 sm:w-24 text-center ${
                        isCompleted ? "text-slate-800" : "text-muted-foreground"
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items in this shipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border relative flex items-center justify-center text-slate-400">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title || "Product"} fill className="object-cover" sizes="64px" />
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-bold mt-1">₹{item.price * item.quantity}</p>
                  </div>
                  {status === "Delivered" && (
                    <div className="flex items-center">
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        <Star className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" /> Write Review
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{order.shippingAddress?.fullName || "Ammar Shaikh"}</p>
                  <p className="text-muted-foreground mt-1">
                    {order.shippingAddress?.addressLine1 || "123 Marketplace Avenue"}<br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                    India
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <PhoneCall className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{order.shippingAddress?.phone || "+91 7801986978"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
