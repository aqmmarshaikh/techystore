"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CouponService } from "@/services/coupon.service";
import { Coupon } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketPercent, Copy, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";



export default function OffersPage() {
  const [offers, setOffers] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchOffers = async () => {
      try {
        const data = await CouponService.getActiveCoupons();
        setOffers(data as unknown as Coupon[]);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-6">
          <TicketPercent className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4">
          Special Offers & Coupons
        </h1>
        <p className="text-lg text-muted-foreground">
          Save more on your favorite products with our exclusive deals and discount codes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {offers.map((offer) => {
          const isExpiringSoon = mounted ? new Date(offer.expiryDate).getTime() - Date.now() < 86400000 * 5 : false; // Less than 5 days

          return (
            <div key={offer.code} className="relative group overflow-hidden rounded-3xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Decorative circles */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 rounded-full pointer-events-none" />

              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <Badge 
                    variant={offer.discountType === "free_shipping" ? "secondary" : "default"}
                    className="text-sm px-3 py-1 uppercase tracking-wider font-bold"
                  >
                    {offer.discountType === "percentage" 
                      ? `${offer.discountValue}% OFF` 
                      : offer.discountType === "flat"
                        ? `₹${offer.discountValue} OFF`
                        : "FREE SHIPPING"}
                  </Badge>
                  {mounted && isExpiringSoon && (
                    <span className="flex items-center text-xs font-medium text-orange-500 bg-orange-100 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3 mr-1" /> Expiring Soon
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-muted-foreground text-sm flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Min. Order: ₹{offer.minimumOrder}
                  </p>
                  {offer.maximumDiscount && (
                    <p className="text-muted-foreground text-sm flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      Max Discount: ₹{offer.maximumDiscount}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Valid till {format(new Date(offer.expiryDate), "dd MMM yyyy")}
                  </p>
                </div>

                <div className="pt-6 border-t border-dashed flex items-center gap-3">
                  <div className="flex-1 bg-muted/50 rounded-xl p-3 border border-dashed border-primary/20 text-center font-mono text-lg font-bold tracking-widest text-primary relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                    {offer.code}
                  </div>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className={`shrink-0 h-12 w-12 rounded-xl transition-all duration-300 ${copiedCode === offer.code ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : ''}`}
                    onClick={() => handleCopy(offer.code)}
                  >
                    {copiedCode === offer.code ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 text-center">
        <p className="text-muted-foreground mb-6">Terms and conditions apply to all offers.</p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    </div>
  );
}
