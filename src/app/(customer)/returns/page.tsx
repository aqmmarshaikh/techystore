"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 min-h-screen">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" asChild className="w-fit -ml-4">
          <Link href="/orders"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Returns & Replacements</h1>
        <p className="text-muted-foreground">Select an item to return or replace</p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-slate-50 border-b px-6 py-3 flex flex-wrap justify-between text-sm text-muted-foreground gap-4">
          <div className="flex gap-8">
            <div>
              <span className="block text-xs uppercase tracking-wider font-semibold">Order Placed</span>
              <span className="text-foreground">24 October 2026</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider font-semibold">Order #</span>
              <span className="text-foreground">12345</span>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border relative">
              <Image src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" alt="Product" fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-green-600 border-green-600">Eligible for Return</Badge>
              </div>
              <h3 className="font-semibold text-lg line-clamp-1">Premium Wireless Headphones</h3>
              <p className="text-sm text-muted-foreground">Return window closes on Nov 24, 2026</p>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Button className="w-full sm:w-48"><RefreshCcw className="w-4 h-4 mr-2" /> Replace Item</Button>
              <Button variant="outline" className="w-full sm:w-48"><Package className="w-4 h-4 mr-2" /> Return for Refund</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
