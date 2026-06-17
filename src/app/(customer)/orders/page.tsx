"use client";

import { OrderHistoryList } from "@/components/orders/OrderHistoryList";

export default function OrderHistoryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground mt-2">Track, return, or buy items again.</p>
        </div>
      </div>
      <OrderHistoryList />
    </div>
  );
}
