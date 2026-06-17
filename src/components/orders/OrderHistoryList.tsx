"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, ShoppingBag, RotateCcw, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderService } from "@/services/order.service";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReturnRequestService } from "@/services/return.service";

export function OrderHistoryList() {
  const { user } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Return Form State
  const [returnReason, setReturnReason] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getOrdersByUserId(user.uid);
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleBuyAgain = (item: any) => {
    addItem({
      id: item.productId,
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: 1,
      image: item.imageUrl,
      stock: 10
    });
    toast.success(`${item.title} added to cart`);
  };

  const openReturnModal = (item: any, orderId: string) => {
    setSelectedItem(item);
    setSelectedOrderId(orderId);
    setReturnReason("");
    setReturnModalOpen(true);
  };

  const openReviewModal = (item: any) => {
    setSelectedItem(item);
    setReviewRating("5");
    setReviewText("");
    setReviewModalOpen(true);
  };

  const submitReturn = async () => {
    if (!returnReason) return toast.error("Please select a reason");
    setIsSubmittingReturn(true);
    try {
      await ReturnRequestService.createReturnRequest({
        userId: user?.uid,
        userName: user?.displayName || "Customer",
        userEmail: user?.email,
        orderId: selectedOrderId,
        productId: selectedItem.productId,
        productTitle: selectedItem.title,
        reason: returnReason,
      });
      toast.success("Return request submitted successfully");
      setReturnModalOpen(false);
    } catch (e) {
      toast.error("Failed to submit return request");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const submitReview = async () => {
    if (!reviewText) return toast.error("Please write a review");
    setIsSubmittingReview(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success("Review submitted! Thank you for your feedback.");
      setReviewModalOpen(false);
    } catch (e) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-semibold">Please sign in to view your orders.</h2>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 border rounded-xl">
            <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold">No orders yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">Looks like you haven't placed any orders yet.</p>
            <Button asChild><Link href="/products">Start Shopping</Link></Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="hover:border-primary/50 transition-colors overflow-hidden">
              <div className="bg-slate-50 border-b px-6 py-3 flex flex-wrap justify-between text-sm text-muted-foreground gap-4">
                <div className="flex gap-8">
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-semibold">Order Placed</span>
                    <span className="text-foreground">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-semibold">Total</span>
                    <span className="text-foreground">₹{order.totalAmount}</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-xs uppercase tracking-wider font-semibold">Ship To</span>
                    <span className="text-foreground text-blue-600 hover:underline cursor-pointer">{order.shippingAddress?.fullName || user.displayName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs uppercase tracking-wider font-semibold">Order # {order.id.slice(0,8).toUpperCase()}</span>
                  <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">View Order Details</Link>
                </div>
              </div>
              
              {order.items?.map((item: any, idx: number) => (
                <CardContent key={idx} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center border-b last:border-b-0">
                  <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border relative flex items-center justify-center text-slate-400">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title || "Product"} fill className="object-cover" sizes="96px" />
                    ) : (
                      <Package className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={order.status === "Delivered" || order.status?.toLowerCase() === "delivered" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                        {order.status || "Processing"}
                      </Badge>
                      {order.status !== "Delivered" && order.status?.toLowerCase() !== "delivered" && (
                        <span className="text-sm font-medium text-amber-600 flex items-center gap-1">
                          <Truck className="w-4 h-4" /> Arriving soon
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-48" onClick={() => handleBuyAgain(item)}>
                      <ShoppingBag className="w-4 h-4 mr-2" /> Buy it again
                    </Button>
                    
                    {order.status === "Delivered" || order.status?.toLowerCase() === "delivered" ? (
                      <Button variant="outline" className="w-full md:w-48" onClick={() => openReviewModal(item)}>
                        <Star className="w-4 h-4 mr-2" /> Write a review
                      </Button>
                    ) : (
                      <Button asChild className="w-full md:w-48">
                        <Link href={`/orders/${order.id}`}>Track Package</Link>
                      </Button>
                    )}
                    
                    <Button variant="outline" className="w-full md:w-48 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => openReturnModal(item, order.id)}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Return or Replace
                    </Button>
                  </div>
                </CardContent>
              ))}
            </Card>
          ))
        )}
      </div>

      {/* Return Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return or Replace Item</DialogTitle>
            <DialogDescription>
              We're sorry this item didn't work out. Please select a reason for the return.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            {selectedItem && (
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border">
                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-12 h-12 rounded object-cover" />
                <span className="font-medium text-sm line-clamp-1">{selectedItem.title}</span>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for return</label>
              <Select value={returnReason} onValueChange={(val) => setReturnReason(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Damaged but box OK">Item arrived damaged</SelectItem>
                  <SelectItem value="Box and item damaged">Box and item both damaged</SelectItem>
                  <SelectItem value="Wrong item sent">Wrong item was sent</SelectItem>
                  <SelectItem value="Missing parts">Missing parts or accessories</SelectItem>
                  <SelectItem value="Defective">Item is defective / doesn't work</SelectItem>
                  <SelectItem value="No longer needed">No longer needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnModalOpen(false)}>Cancel</Button>
            <Button onClick={submitReturn} disabled={isSubmittingReturn || !returnReason}>
              {isSubmittingReturn ? "Submitting..." : "Submit Return Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Product Review</DialogTitle>
            <DialogDescription>
              Share your thoughts with other customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            {selectedItem && (
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border">
                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-12 h-12 rounded object-cover" />
                <span className="font-medium text-sm line-clamp-1">{selectedItem.title}</span>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Overall rating</label>
              <Select value={reviewRating} onValueChange={(val) => setReviewRating(val || "5")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars - Excellent</SelectItem>
                  <SelectItem value="4">4 Stars - Good</SelectItem>
                  <SelectItem value="3">3 Stars - Average</SelectItem>
                  <SelectItem value="2">2 Stars - Poor</SelectItem>
                  <SelectItem value="1">1 Star - Terrible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Written review</label>
              <Textarea 
                placeholder="What did you like or dislike? What did you use this product for?" 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
            <Button onClick={submitReview} disabled={isSubmittingReview || !reviewText}>
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
